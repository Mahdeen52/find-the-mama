import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, handleApiError, ok } from "@/lib/http";
import { vendorSchema } from "@/lib/validations";
import { serializeVendor, vendorInclude } from "@/lib/vendor";
import { DEMO_VENDORS } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) { try { const vendor = await db.vendor.findUnique({ where: { id: params.id }, include: vendorInclude }); return vendor ? ok(serializeVendor(vendor)) : fail("Vendor not found", 404); } catch (error) { const demo = DEMO_VENDORS.find((vendor) => vendor.id === params.id); return demo ? ok(demo) : handleApiError(error); } }
export async function PUT(request: Request, { params }: { params: { id: string } }) { try { await requireAuth(); const parsed = vendorSchema.safeParse(await request.json()); if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid vendor", 422); const { photoUrls, ...input } = parsed.data; const vendor = await db.vendor.update({ where: { id: params.id }, data: { ...input, phone: input.phone || null, operatingHours: input.operatingHours, specialties: input.specialties }, include: vendorInclude }); return ok(serializeVendor(vendor)); } catch (error) { return handleApiError(error); } }
export async function DELETE(_: Request, { params }: { params: { id: string } }) { try { const user = await requireAuth(); if (user.role !== "ADMIN" && user.role !== "MODERATOR") throw new Error("FORBIDDEN"); await db.vendor.delete({ where: { id: params.id } }); return ok({ deleted: true }); } catch (error) { return handleApiError(error); } }
