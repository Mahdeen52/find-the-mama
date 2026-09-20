import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { recalculateVendor } from "@/lib/vendor";

type Tx = Prisma.TransactionClient | PrismaClient;

export async function getAdminSettings(client: Tx = db) {
  return client.adminSettings.upsert({ where: { id: "default" }, create: {}, update: {} });
}

export async function logAdminAction(client: Tx, input: { actorId: string; action: string; entityType: string; entityId: string; reason?: string; metadata?: Prisma.InputJsonValue }) {
  return client.activityLog.create({ data: { userId: input.actorId, action: input.action, entityType: input.entityType, entityId: input.entityId, reason: input.reason, metadata: input.metadata } });
}

export async function computeWeightedRating(vendorId: string) {
  await recalculateVendor(db, vendorId);
  return db.vendor.findUnique({ where: { id: vendorId }, select: { ratingAvg: true, weightedRatingAvg: true, ratingCount: true, trustedReviewCount: true } });
}

export async function recalcTrustScore(userId: string) {
  const settings = await getAdminSettings();
  const [reviews, qualifyingVendors, penalties] = await Promise.all([
    db.review.findMany({ where: { userId, isHidden: false, isSpam: false }, select: { photos: true } }),
    db.vendor.count({ where: { addedById: userId, verificationLevel: { gte: 1 }, status: "ACTIVE" } }),
    db.activityLog.aggregate({ where: { userId, action: { in: ["trust_manual_adjustment", "spam_penalty", "fake_vendor_penalty"] } }, _sum: { pointsEarned: true } })
  ]);
  const reviewPoints = reviews.reduce((sum, review) => sum + (Array.isArray(review.photos) && review.photos.length ? settings.pointsReviewWithPhoto : settings.pointsReviewWithoutPhoto), 0);
  const score = reviewPoints + qualifyingVendors * settings.pointsVendorLevel1 + (penalties._sum.pointsEarned || 0);
  return db.user.update({ where: { id: userId }, data: { trustScore: score, isTrustedContributor: score >= settings.trustScoreThresholdForTrusted } });
}

export async function recalcAllTrustScores() {
  const settings = await getAdminSettings();
  const users = await db.user.findMany({ select: {
    id: true,
    reviews: { where: { isHidden: false, isSpam: false }, select: { photos: true } },
    vendors: { where: { verificationLevel: { gte: 1 }, status: "ACTIVE" }, select: { id: true } },
    activities: { where: { action: { in: ["trust_manual_adjustment", "spam_penalty", "fake_vendor_penalty"] } }, select: { pointsEarned: true } }
  } });
  if (users.length) await db.$transaction(users.map((user) => {
    const reviewPoints = user.reviews.reduce((sum, review) => sum + (Array.isArray(review.photos) && review.photos.length ? settings.pointsReviewWithPhoto : settings.pointsReviewWithoutPhoto), 0);
    const score = reviewPoints + user.vendors.length * settings.pointsVendorLevel1 + user.activities.reduce((sum, activity) => sum + activity.pointsEarned, 0);
    return db.user.update({ where: { id: user.id }, data: { trustScore: score, isTrustedContributor: score >= settings.trustScoreThresholdForTrusted } });
  }));
  return users.length;
}

export async function recomputeAllWeightedRatings() {
  const [settings, vendors] = await Promise.all([
    getAdminSettings(),
    db.vendor.findMany({ select: { id: true, reviews: { where: { isHidden: false, isSpam: false }, select: { rating: true, hygieneRating: true, user: { select: { isTrustedContributor: true } } } } } })
  ]);
  if (vendors.length) await db.$transaction(vendors.map((vendor) => {
    const simpleTotal = vendor.reviews.reduce((sum, review) => sum + review.rating, 0);
    const hygieneTotal = vendor.reviews.reduce((sum, review) => sum + review.hygieneRating, 0);
    const weighted = vendor.reviews.reduce((total, review) => { const weight = review.user.isTrustedContributor ? settings.trustedReviewWeight : settings.regularReviewWeight; return { score: total.score + review.rating * weight, weight: total.weight + weight }; }, { score: 0, weight: 0 });
    return db.vendor.update({ where: { id: vendor.id }, data: { ratingAvg: vendor.reviews.length ? simpleTotal / vendor.reviews.length : 0, weightedRatingAvg: weighted.weight ? weighted.score / weighted.weight : 0, hygieneScore: vendor.reviews.length ? hygieneTotal / vendor.reviews.length : 0, ratingCount: vendor.reviews.length, trustedReviewCount: vendor.reviews.filter((review) => review.user.isTrustedContributor).length } });
  }));
  return vendors.length;
}

export async function autoAssignLevel1(actorId?: string) {
  const settings = await getAdminSettings();
  const candidates = await db.vendor.findMany({ where: { verificationLevel: 0, status: "ACTIVE" }, select: { id: true, addedById: true, reviews: { where: { isHidden: false, isSpam: false, user: { isTrustedContributor: true } }, select: { photos: true } } } });
  const qualifying = candidates.map((vendor) => ({ ...vendor, trustedPhotoReviews: vendor.reviews.filter((review) => Array.isArray(review.photos) && review.photos.length > 0).length })).filter((vendor) => vendor.trustedPhotoReviews >= settings.autoLevel1MinTrustedPhotoReviews);
  if (qualifying.length) await db.$transaction(qualifying.flatMap((vendor) => [
    db.vendor.update({ where: { id: vendor.id }, data: { verificationLevel: 1, isVerified: true } }),
    db.user.update({ where: { id: vendor.addedById }, data: { trustScore: { increment: settings.pointsVendorLevel1 } } }),
    db.activityLog.create({ data: { userId: actorId || vendor.addedById, action: "vendor_auto_verified", entityType: "vendor", entityId: vendor.id, pointsEarned: settings.pointsVendorLevel1, metadata: { level: 1, trustedPhotoReviews: vendor.trustedPhotoReviews } } })
  ]));
  return qualifying.length;
}
