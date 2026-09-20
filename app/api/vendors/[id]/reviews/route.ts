import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, handleApiError, ok } from "@/lib/http";
import { reviewSchema } from "@/lib/validations";
import { recalculateVendor } from "@/lib/vendor";
import { awardContribution } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) { try { const rows = await db.review.findMany({ where: { vendorId: params.id }, include: { user: { select: { id: true, name: true, photoUrl: true } } }, orderBy: { createdAt: "desc" } }); return ok(rows.map((row) => ({ ...row, photos: row.photos as string[], createdAt: row.createdAt.toISOString() }))); } catch (error) { return handleApiError(error); } }
export async function POST(request: Request, { params }: { params: { id: string } }) { try { const user = await requireAuth(); const parsed = reviewSchema.safeParse(await request.json()); if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid review", 422); const review = await db.$transaction(async (tx) => { const existing = await tx.review.findUnique({ where: { vendorId_userId: { vendorId: params.id, userId: user.id } } }); const saved = await tx.review.upsert({ where: { vendorId_userId: { vendorId: params.id, userId: user.id } }, create: { ...parsed.data, photos: parsed.data.photos, vendorId: params.id, userId: user.id }, update: { ...parsed.data, photos: parsed.data.photos } }); if (!existing) await awardContribution(tx, { userId: user.id, action: "add_review", entityType: "review", entityId: saved.id }); return saved; }); await recalculateVendor(db, params.id); return ok({ ...review, photos: review.photos as string[] }, 201); } catch (error) { return handleApiError(error); } }
