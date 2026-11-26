"use client";

import { useTranslations } from "next-intl";
import { StatePanel } from "@/components/ui";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("Common");
  return <div className="page-section"><StatePanel page error title={t("errorTitle")} description={t("error")} action={<button type="button" onClick={reset} className="btn-primary">{t("retry")}</button>} /></div>;
}
