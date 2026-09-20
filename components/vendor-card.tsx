"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Clock3, MapPin, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Vendor } from "@/lib/types";
import { isOpenNow } from "@/lib/utils";

export function VendorCard({ vendor }: { vendor: Vendor }) {
  const t = useTranslations("Common");
  const open = isOpenNow(vendor.operatingHours);
  const image = vendor.photos?.[0]?.photoUrl;
  return (
    <Link href={`/vendor/${vendor.id}`} className="card group block overflow-hidden transition hover:-translate-y-1 hover:border-orange-200">
      <div className="relative aspect-[16/10] overflow-hidden bg-orange-100">
        {image ? <Image src={image} alt={vendor.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw"/> : <div className="grid h-full place-items-center text-5xl">🥣</div>}
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-xs font-black ${open ? "bg-emerald-600 text-white" : "bg-white/90 text-stone-600"}`}><Clock3 className="mr-1 inline" size={13}/>{open ? t("openNow") : t("closed")}</span>
        {vendor.priceRange && <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-bold text-white">{vendor.priceRange === "BUDGET" ? "৳" : vendor.priceRange === "MODERATE" ? "৳৳" : "৳৳৳"}</span>}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3"><h3 className="text-xl font-black leading-tight">{vendor.name}</h3><span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-sm font-black"><Star size={15} className="fill-amber-400 text-amber-400"/>{vendor.ratingAvg.toFixed(1)}</span></div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500"><MapPin size={15}/>{vendor.area}{vendor.distance != null && <> · {vendor.distance.toFixed(1)} km</>}</p>
        <div className="mt-4 flex flex-wrap gap-2">{vendor.specialties.slice(0, 2).map((tag) => <span key={tag} className="chip">{tag}</span>)}</div>
        <div className="mt-5 flex items-center justify-between border-t border-orange-100 pt-4 text-sm"><span className="text-stone-500">{vendor.ratingCount} {t("reviews")}</span>{vendor.isVerified && <span className="flex items-center gap-1 font-bold text-leaf"><BadgeCheck size={17}/>{t("verified")}</span>}</div>
      </div>
    </Link>
  );
}
