"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Brand } from "@/components/header";

const links = [
  ["/search", "search"], ["/vendor/add", "addMama"], ["/rewards", "rewards"], ["/auth/login", "login"],
  ["/privacy", "privacy"], ["/terms", "terms"], ["/contact", "contact"]
] as const;

export function Footer() {
  const t = useTranslations("Common");
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page flex flex-col gap-6 py-8 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Brand />
          <p className="mt-2 text-sm text-muted" lang="bn">{t("footer")}</p>
        </div>
        <nav aria-label={t("footerNav")} className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map(([href, label]) => <Link key={href} href={href} className="nav-link min-h-11 px-1">{t(label)}</Link>)}
        </nav>
      </div>
    </footer>
  );
}
