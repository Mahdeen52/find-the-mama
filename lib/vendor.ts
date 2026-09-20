import type { Prisma } from "@prisma/client";
import type { Hours } from "@/lib/types";

export const vendorInclude = { photos: { orderBy: [{ isPrimary: "desc" as const }, { createdAt: "desc" as const }] }, reviews: { orderBy: { createdAt: "desc" as const }, include: { user: { select: { id: true, name: true, photoUrl: true } } } }, addedBy: { select: { id: true, name: true } } } satisfies Prisma.VendorInclude;

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
  const totals = await db.review.aggregate({ where: { vendorId }, _avg: { rating: true, hygieneRating: true }, _count: true });
  await db.vendor.update({ where: { id: vendorId }, data: { ratingAvg: totals._avg.rating || 0, hygieneScore: totals._avg.hygieneRating || 0, ratingCount: totals._count } });
}
