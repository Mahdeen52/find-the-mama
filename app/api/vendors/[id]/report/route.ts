import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, handleApiError, ok } from "@/lib/http";
import { reportSchema } from "@/lib/validations";
export async function POST(request: Request, { params }: { params: { id: string } }) { try { const user = await requireAuth(); const parsed = reportSchema.safeParse(await request.json()); if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid report", 422); return ok(await db.report.create({ data: { ...parsed.data, vendorId: params.id, userId: user.id } }), 201); } catch (error) { return handleApiError(error); } }
