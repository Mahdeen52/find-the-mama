"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PhotoPlaceholder } from "@/components/ui";

export function VendorPhoto({ src, alt, sizes, priority = false }: {
  src?: string | null; alt: string; sizes: string; priority?: boolean;
}) {
  const t = useTranslations("Common");
  const [failed, setFailed] = useState<string>();
  if (!src || failed === src) return <PhotoPlaceholder label={t("missingPhoto")} />;
  const optimized = src.startsWith("/") && !src.startsWith("//") || /^https:\/\/(?:res\.cloudinary\.com|images\.unsplash\.com)\//.test(src);
  return <Image src={src} alt={alt} sizes={sizes} priority={priority} fill unoptimized={!optimized} className="object-cover" onError={() => setFailed(src)} />;
}
