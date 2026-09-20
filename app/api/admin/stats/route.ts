import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError, ok } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await requireAdmin(); const now = Date.now(); const sevenDays = new Date(now - 7 * 86400000); const thirtyDays = new Date(now - 30 * 86400000);
    const [vendors, levels, users, trustedUsers, reviews7, reviews30, openReports, fake30, byArea, byZone, activity, contributors] = await Promise.all([
      db.vendor.count(), db.vendor.groupBy({ by: ["verificationLevel"], _count: true }), db.user.count(), db.user.count({ where: { isTrustedContributor: true } }), db.review.count({ where: { createdAt: { gte: sevenDays } } }), db.review.count({ where: { createdAt: { gte: thirtyDays } } }), db.report.count({ where: { status: { in: ["OPEN", "REVIEWING"] } } }), db.activityLog.count({ where: { action: "vendor_marked_fake", createdAt: { gte: thirtyDays } } }), db.vendor.groupBy({ by: ["area"], _count: true }), db.vendor.groupBy({ by: ["zone"], _count: true }), db.activityLog.findMany({ take: 12, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, role: true } } } }), db.user.findMany({ take: 8, orderBy: [{ contributionPoints: "desc" }, { trustScore: "desc" }], select: { id: true, name: true, contributionPoints: true, trustScore: true, isTrustedContributor: true } })
    ]);
    return ok({ vendors, levels: Object.fromEntries(levels.map((v) => [v.verificationLevel, v._count])), users, trustedUsers, reviews7, reviews30, openReports, fake30, byArea: byArea.map((v) => ({ label: v.area, count: v._count })), byZone: byZone.map((v) => ({ label: v.zone, count: v._count })), activity, contributors });
  } catch (error) { return handleApiError(error); }
}
