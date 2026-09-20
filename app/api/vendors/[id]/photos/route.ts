import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, handleApiError, ok } from "@/lib/http";
import { photoSchema } from "@/lib/validations";
import { awardContribution } from "@/lib/gamification";
export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: { id: string } }) { try { return ok(await db.photo.findMany({ where: { vendorId: params.id }, orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }] })); } catch (error) { return handleApiError(error); } }
export async function POST(request: Request, { params }: { params: { id: string } }) { try { const user = await requireAuth(); const parsed = photoSchema.safeParse(await request.json()); if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid photo", 422); const photo = await db.$transaction(async (tx) => { const count = await tx.photo.count({ where: { vendorId: params.id } }); const created = await tx.photo.create({ data: { ...parsed.data, vendorId: params.id, userId: user.id, isPrimary: count === 0 } }); await awardContribution(tx, { userId: user.id, action: "add_photo", entityType: "photo", entityId: created.id }); return created; }); return ok(photo, 201); } catch (error) { return handleApiError(error); } }
