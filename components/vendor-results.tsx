"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { DynamicVendorMap } from "@/components/map-dynamic";
import type { DiscoveryView } from "@/components/discovery-controls";
import { Skeleton, StatePanel } from "@/components/ui";
import { VendorCard } from "@/components/vendor-card";
import type { Vendor } from "@/lib/types";

export function VendorResults({ vendors, loading, error, retry, view, columns = 3 }: {
  vendors: Vendor[]; loading: boolean; error: boolean; retry: () => void; view: DiscoveryView; columns?: 2 | 3;
}) {
  const t = useTranslations("Common");
  const grid = `grid gap-4 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : "xl:gap-6"}`;
  if (loading) {
    return view === "map" ? <Skeleton className="h-[420px]" label={t("loading")} /> :
      <div className={grid} aria-busy="true">{Array.from({ length: columns }, (_, index) => <Skeleton key={index} className="h-72" label={index === 0 ? t("loading") : undefined} />)}</div>;
  }
  if (error) return <StatePanel error title={t("errorTitle")} description={t("error")} action={<button type="button" className="btn-primary" onClick={retry}>{t("retry")}</button>} />;
  if (!vendors.length) return <StatePanel title={t("emptyTitle")} description={t("emptyDescription")} action={<Link href="/vendor/add" className="btn-primary">{t("addMama")}</Link>} />;
  if (view === "map") return <DynamicVendorMap vendors={vendors} />;
  return <div className={grid}>{vendors.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)}</div>;
}
