"use client";

import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Rating } from "@/components/ui";
import { VendorPhoto } from "@/components/vendor-photo";
import type { Vendor } from "@/lib/types";
import { isOpenNow, listingRating } from "@/lib/utils";

export function VendorCard({ vendor }: { vendor: Vendor }) {
  const t = useTranslations("Common");
  const format = useFormatter();
  const open = isOpenNow(vendor.operatingHours);
  const rating = listingRating(vendor);

  return (
    <Link href={`/vendor/${vendor.id}`} className="card flex h-full min-w-0 flex-col overflow-hidden transition hover:border-brand-100 hover:shadow-raised">
      <div className="relative aspect-[16/10] bg-surface">
        <VendorPhoto src={vendor.photos?.[0]?.photoUrl} alt="" sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />
        <span className="chip absolute left-3 top-3 bg-white">
          <span className={`h-2 w-2 rounded-full ${open ? "bg-emerald-700" : "bg-stone-500"}`} aria-hidden="true" />
          {t(open ? "openNow" : "closed")}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title min-w-0 break-words">{vendor.name}</h3>
          {vendor.ratingCount > 0 && <Rating value={rating} label={t("rating", { value: rating.toFixed(1) })} />}
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <MapPin size={15} aria-hidden="true" />{vendor.area}
          {vendor.distance != null && <span>· {format.number(vendor.distance, { maximumFractionDigits: 1 })} km</span>}
          {vendor.priceRange && <span>· {t(vendor.priceRange.toLowerCase() as "budget" | "moderate" | "premium")}</span>}
        </p>
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap gap-1.5">
            {vendor.specialties.slice(0, 2).map((tag) => <span key={tag} className="chip">{tag}</span>)}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
            <span>{vendor.ratingCount ? `${format.number(vendor.ratingCount)} ${t("reviews")}` : t("unrated")}</span>
            {vendor.isVerified && <span className="inline-flex items-center gap-1 font-semibold text-brand-700"><BadgeCheck size={15} aria-hidden="true" />{t("verified")}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
