import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError, ok } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() { try { const user = await requireAuth(); if (!user.isAdmin && !user.email?.toLowerCase().includes("admin")) throw new Error("FORBIDDEN"); const [vendors, users, reports, byArea, rows] = await Promise.all([db.vendor.count(), db.user.count(), db.report.count({ where: { status: "OPEN" } }), db.vendor.groupBy({ by: ["area"], _count: true, orderBy: { area: "asc" } }), db.vendor.findMany({ select: { id: true, name: true, area: true, ratingAvg: true, status: true }, orderBy: { createdAt: "desc" } })]); return ok({ vendors, users, reports, byArea: byArea.map((item) => ({ area: item.area, count: item._count })), rows }); } catch (error) { return handleApiError(error); } }
