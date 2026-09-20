import type { Prisma } from "@prisma/client";
import type { Hours } from "@/lib/types";

export const vendorInclude = { photos: { where: { isHidden: false }, orderBy: [{ isPrimary: "desc" as const }, { createdAt: "desc" as const }] }, reviews: { where: { isHidden: false, isSpam: false }, orderBy: { createdAt: "desc" as const }, include: { user: { select: { id: true, name: true, photoUrl: true } } } }, addedBy: { select: { id: true, name: true } } } satisfies Prisma.VendorInclude;

export function serializeVendor<T extends { operatingHours: unknown; specialties: unknown; reviews?: { photos: unknown; createdAt: Date }[]; createdAt: Date }>(vendor: T) {
  return {
    ...vendor,
    operatingHours: vendor.operatingHours as Hours,
    specialties: vendor.specialties as string[],
    createdAt: vendor.createdAt.toISOString(),
    reviews: vendor.reviews?.map((review) => ({ ...review, photos: review.photos as string[], createdAt: review.createdAt.toISOString() }))
  };
}

export async function recalculateVendor(db: typeof import("@/lib/db").db, vendorId: string) {
  const settings = await db.adminSettings.upsert({ where: { id: "default" }, create: {}, update: {} });
  const reviews = await db.review.findMany({ where: { vendorId, isHidden: false, isSpam: false }, select: { rating: true, hygieneRating: true, user: { select: { isTrustedContributor: true } } } });
  const simple = reviews.reduce((sum, review) => sum + review.rating, 0);
  const hygiene = reviews.reduce((sum, review) => sum + review.hygieneRating, 0);
  const weighted = reviews.reduce((acc, review) => {
    const weight = review.user.isTrustedContributor ? settings.trustedReviewWeight : settings.regularReviewWeight;
    return { score: acc.score + review.rating * weight, weight: acc.weight + weight };
  }, { score: 0, weight: 0 });
  await db.vendor.update({ where: { id: vendorId }, data: {
    ratingAvg: reviews.length ? simple / reviews.length : 0,
    weightedRatingAvg: weighted.weight ? weighted.score / weighted.weight : 0,
    hygieneScore: reviews.length ? hygiene / reviews.length : 0,
    ratingCount: reviews.length,
    trustedReviewCount: reviews.filter((review) => review.user.isTrustedContributor).length
  } });
}
