"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Skeleton, StatePanel } from "@/components/ui";
import { VendorForm } from "@/components/vendor-form";
import { api, ApiError } from "@/lib/api";
import type { Vendor } from "@/lib/types";

export default function EditVendorPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations("Common");
  const vendorText = useTranslations("Vendor");
  const vendor = useQuery({ queryKey: ["vendor", id], queryFn: () => api<Vendor>(`/api/vendors/${id}`), enabled: Boolean(user) });

  useEffect(() => {
    if (!loading && !user) router.replace(`/auth/login?next=${encodeURIComponent(`/vendor/${id}/edit`)}`);
  }, [loading, user, router, id]);

  if (loading || !user || vendor.isPending) return <div className="page-section"><Skeleton className="mx-auto h-80 max-w-3xl" label={t("loading")} /></div>;
  if (!vendor.data) {
    const missing = vendor.error instanceof ApiError && vendor.error.status === 404;
    return <div className="page-section"><StatePanel title={missing ? vendorText("notFound") : t("errorTitle")} description={missing ? undefined : t("error")} error={!missing} action={
      missing ? <Link className="btn-primary" href="/search">{t("search")}</Link> : <button className="btn-primary" onClick={() => void vendor.refetch()}>{t("retry")}</button>
    } /></div>;
  }
  return <VendorForm key={id} vendor={vendor.data} />;
}
