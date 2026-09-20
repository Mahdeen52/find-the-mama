"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import en from "@/messages/en.json";
import bn from "@/messages/bn.json";
import { AuthProvider } from "@/components/auth-provider";

export type Locale = "en" | "bn";
export const LocaleContext = React.createContext<{ locale: Locale; toggle: () => void }>({ locale: "bn", toggle: () => undefined });
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  const [locale, setLocale] = useState<Locale>("bn");
  useEffect(() => { const stored = localStorage.getItem("ftm_locale"); if (stored === "en" || stored === "bn") setLocale(stored); }, []);
  const toggle = () => setLocale((current) => { const next = current === "bn" ? "en" : "bn"; localStorage.setItem("ftm_locale", next); return next; });
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleContext.Provider value={{ locale, toggle }}>
        <NextIntlClientProvider locale={locale} messages={locale === "bn" ? bn : en} timeZone="Asia/Dhaka">
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="top-center" toastOptions={{ style: { borderRadius: 16, background: "#211711", color: "white" } }} />
        </NextIntlClientProvider>
      </LocaleContext.Provider>
    </QueryClientProvider>
  );
}
