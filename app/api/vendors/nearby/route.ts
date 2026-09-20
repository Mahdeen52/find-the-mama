import { db } from "@/lib/db";
import { fail, handleApiError, ok } from "@/lib/http";
import { haversineKm } from "@/lib/utils";
import { serializeVendor } from "@/lib/vendor";
import { nearbyDemoVendors } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams; const lat = Number(p.get("lat")); const lng = Number(p.get("lng")); const radius = Math.min(Number(p.get("radius")) || 2, 25);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return fail("lat and lng are required", 422);
  try { const rows = await db.vendor.findMany({ where: { status: "ACTIVE", lat: { gte: lat - radius / 110.574, lte: lat + radius / 110.574 }, lng: { gte: lng - radius / 111.320, lte: lng + radius / 111.320 } }, include: { photos: true } }); return ok(rows.map((row) => ({ ...serializeVendor(row), distance: haversineKm(lat, lng, row.lat, row.lng) })).filter((row) => row.distance <= radius).sort((a,b) => a.distance-b.distance)); } catch (error) { console.warn("Database unavailable; serving nearby demo vendors", error); return ok(nearbyDemoVendors(lat, lng, radius)); }
}
