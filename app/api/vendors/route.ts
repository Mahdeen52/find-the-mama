import type { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, handleApiError, ok } from "@/lib/http";
import { isOpenNow } from "@/lib/utils";
import { haversineKm } from "@/lib/utils";
import { queryDemoVendors } from "@/lib/demo-data";
import { vendorSchema } from "@/lib/validations";
import { serializeVendor } from "@/lib/vendor";
import { awardContribution } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const limit = Math.min(Math.max(Number(params.get("limit")) || 20, 1), 50);
    const offset = Math.max(Number(params.get("offset")) || 0, 0);
    const minRating = Number(params.get("minRating")) || undefined;
    const q = params.get("q")?.trim(); const area = params.get("area"); const priceRange = params.get("priceRange");
    const where: Prisma.VendorWhereInput = { status: "ACTIVE", ...(area && { area }), ...(minRating && { ratingAvg: { gte: minRating } }), ...(priceRange && ["BUDGET","MODERATE","PREMIUM"].includes(priceRange) && { priceRange: priceRange as "BUDGET"|"MODERATE"|"PREMIUM" }), ...(q && { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { area: { contains: q, mode: "insensitive" } }] }) };
    const sort = params.get("sort"); const lat = Number(params.get("lat")); const lng = Number(params.get("lng"));
    const hasCoords = params.has("lat") && params.has("lng") && Number.isFinite(lat) && Number.isFinite(lng);
    const rows = await db.vendor.findMany({ where, include: { photos: { orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }], take: 3 } }, orderBy: sort === "recentlyAdded" ? { createdAt: "desc" } : { ratingAvg: "desc" } });
    const specialties = params.get("specialties")?.split(",").filter(Boolean) || [];
    const filtered = rows.filter((row) => (!params.get("openNow") || isOpenNow(row.operatingHours as never)) && (!specialties.length || specialties.every((item) => (row.specialties as string[]).includes(item))));
    const serialized = filtered.map(serializeVendor).map((row) => ({ ...row, ...(hasCoords && { distance: haversineKm(lat, lng, row.lat, row.lng) }) }));
    serialized.sort((a, b) => sort === "distance" && hasCoords ? (a.distance ?? 999) - (b.distance ?? 999) : sort === "area" ? a.area.localeCompare(b.area) || b.ratingAvg - a.ratingAvg : sort === "recentlyAdded" ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : b.ratingAvg - a.ratingAvg);
    return ok(serialized.slice(offset, offset + limit));
  } catch (error) { console.warn("Database unavailable; serving demo vendors", error); return ok(queryDemoVendors(request.url)); }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(); const parsed = vendorSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid vendor", 422);
    const { photoUrls, ...input } = parsed.data;
    const vendor = await db.$transaction(async (tx) => {
      const created = await tx.vendor.create({ data: { ...input, phone: input.phone || null, operatingHours: input.operatingHours, specialties: input.specialties, addedById: user.id, photos: { create: photoUrls.map((photoUrl, index) => ({ photoUrl, userId: user.id, isPrimary: index === 0 })) } }, include: { photos: true } });
      await awardContribution(tx, { userId: user.id, action: "add_vendor", entityType: "vendor", entityId: created.id });
      return created;
    });
    return ok(serializeVendor(vendor), 201);
  } catch (error) { return handleApiError(error); }
}
