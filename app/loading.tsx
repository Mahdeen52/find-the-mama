"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  const t = useTranslations("Common");
  return <div className="page-section"><Skeleton className="h-80" label={t("loading")} /></div>;
}
