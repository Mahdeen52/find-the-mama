import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, handleApiError, ok } from "@/lib/http";
export async function DELETE(_: Request, { params }: { params: { id: string } }) { try { const user = await requireAuth(); const photo = await db.photo.findUnique({ where: { id: params.id } }); if (!photo) return fail("Photo not found", 404); if (photo.userId !== user.id && !user.isAdmin) return fail("Forbidden", 403); await db.photo.delete({ where: { id: params.id } }); return ok({ deleted: true }); } catch (error) { return handleApiError(error); } }
