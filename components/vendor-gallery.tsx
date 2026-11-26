"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { VendorPhoto } from "@/components/vendor-photo";
import type { Photo } from "@/lib/types";

export function VendorGallery({ photos, name }: { photos: Photo[]; name: string }) {
  const t = useTranslations("Vendor");
  const [index, setIndex] = useState(0);
  const current = photos.length ? index % photos.length : 0;
  const photo = photos[current];
  const counter = t("photo", { current: current + 1, total: photos.length });

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-surface sm:aspect-[16/9]" role="group" aria-label={t("photos")}>
      <VendorPhoto src={photo?.photoUrl} alt={photo?.caption || name} sizes="(max-width: 1023px) 100vw, 64vw" priority={current === 0} />
      {photos.length > 1 && (
        <>
          <button type="button" onClick={() => setIndex((current - 1 + photos.length) % photos.length)} className="btn-secondary absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 px-0" aria-label={t("previousPhoto")}><ChevronLeft aria-hidden="true" size={21} /></button>
          <button type="button" onClick={() => setIndex((current + 1) % photos.length)} className="btn-secondary absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 px-0" aria-label={t("nextPhoto")}><ChevronRight aria-hidden="true" size={21} /></button>
          <span className="chip absolute bottom-3 right-3 bg-white" aria-live="polite">{counter}</span>
        </>
      )}
    </div>
  );
}
