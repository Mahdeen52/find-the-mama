import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError, ok } from "@/lib/http";
import { nextBadge } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();
    const [vendors, reviews, photos, recentActivity] = await Promise.all([
      db.vendor.count({ where: { addedById: user.id } }),
      db.review.count({ where: { userId: user.id } }),
      db.photo.count({ where: { userId: user.id } }),
      db.activityLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 12 })
    ]);
    const badges = Array.isArray(user.badges) ? user.badges.filter((badge): badge is string => typeof badge === "string") : [];
    return ok({
      points: user.contributionPoints,
      badges,
      nextBadge: nextBadge(user.contributionPoints),
      counts: { vendors, reviews, photos },
      recentActivity: recentActivity.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))
    });
  } catch (error) { return handleApiError(error); }
}
