"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui";
import { VendorForm } from "@/components/vendor-form";

export default function AddVendorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations("Common");
  useEffect(() => { if (!loading && !user) router.replace("/auth/login?next=/vendor/add"); }, [loading, user, router]);
  if (loading || !user) return <div className="page-section"><Skeleton className="mx-auto h-80 max-w-3xl" label={t("loading")} /></div>;
  return <VendorForm />;
}
