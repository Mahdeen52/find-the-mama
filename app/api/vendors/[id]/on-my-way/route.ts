import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError, ok } from "@/lib/http";
const since = () => new Date(Date.now() - 15 * 60 * 1000);
export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: { id: string } }) { try { const count = await db.activityLog.count({ where: { entityType: "vendor", entityId: params.id, action: "on_my_way", createdAt: { gte: since() } } }); return ok({ count }); } catch (error) { return handleApiError(error); } }
export async function POST(_: Request, { params }: { params: { id: string } }) { try { const user = await requireAuth(); const recent = await db.activityLog.findFirst({ where: { userId: user.id, entityType: "vendor", entityId: params.id, action: "on_my_way", createdAt: { gte: since() } } }); if (!recent) await db.activityLog.create({ data: { userId: user.id, action: "on_my_way", entityType: "vendor", entityId: params.id } }); const count = await db.activityLog.count({ where: { entityType: "vendor", entityId: params.id, action: "on_my_way", createdAt: { gte: since() } } }); console.info("onMyWay", { vendorId: params.id, userId: user.id }); return ok({ count }); } catch (error) { return handleApiError(error); } }
