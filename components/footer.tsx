"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Common");
  return <footer className="mt-20 border-t border-orange-100 bg-white"><div className="container-page flex flex-col gap-4 py-10 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-ink">{t("brand")}</p><p>{t("footer")}</p></div><div className="flex gap-5"><Link href="/search">{t("search")}</Link><Link href="/vendor/add">{t("addMama")}</Link><span>© {new Date().getFullYear()} {t("rights")}</span></div></div></footer>;
}
