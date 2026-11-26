"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function InfoPage({ kind }: { kind: "privacy" | "terms" | "contact" }) {
  const t = useTranslations("Info");
  const common = useTranslations("Common");
  return (
    <div className="page-section">
      <article className="card mx-auto max-w-3xl space-y-6 p-6 sm:p-8">
        <h1 className="page-title">{common(kind)}</h1>
        {kind === "contact" ? (
          <>
            <p className="text-muted">{t("contactBody")}</p>
            <p className="text-muted">{t("contactListing")}</p>
            <div className="flex flex-wrap gap-2">
              <a href="https://github.com/Mahdeen52/find-the-mama/issues" className="btn-primary">{t("github")}</a>
              <Link className="btn-secondary" href="/search">{common("search")}</Link>
            </div>
          </>
        ) : (
          (kind === "privacy" ? ["location", "account", "public"] : ["accuracy", "contributions", "moderation"]).map((section) => (
            <section key={section}>
              <h2 className="card-title">{t(`${section}Title`)}</h2>
              <p className="mt-2 leading-relaxed text-muted">{t(section)}</p>
            </section>
          ))
        )}
      </article>
    </div>
  );
}
