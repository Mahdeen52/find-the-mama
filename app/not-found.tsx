"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { StatePanel } from "@/components/ui";

export default function NotFound() {
  const t = useTranslations("Common");
  return <div className="page-section"><StatePanel page title={t("notFound")} description={t("notFoundDescription")} action={<Link href="/" className="btn-primary">{t("home")}</Link>} /></div>;
}
