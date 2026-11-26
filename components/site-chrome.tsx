"use client";

import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header, MobileNavigation } from "@/components/header";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("Common");
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  const showBottomNav = !admin && pathname !== "/" && !pathname.startsWith("/auth/");

  return (
    <div className={`flex min-h-screen flex-col ${showBottomNav ? "pb-[calc(58px+env(safe-area-inset-bottom))] md:pb-0" : ""}`}>
      <a href="#main-content" className="btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50">{t("skip")}</a>
      {!admin && <Header />}
      <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
      {!admin && <Footer />}
      {showBottomNav && <Suspense fallback={null}><MobileNavigation /></Suspense>}
    </div>
  );
}
