"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, Globe2, LogIn, Plus, Search, Shield, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useState } from "react";
import { LocaleContext } from "@/app/providers";
import { useAuth } from "@/components/auth-provider";

export function Header() {
  const t = useTranslations("Common");
  const { toggle } = useContext(LocaleContext);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100/80 bg-cream/90 backdrop-blur-xl">
      <div className="container-page flex min-h-[72px] items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3" aria-label={t("home")}>
          <span className="relative h-11 w-11 overflow-hidden rounded-2xl border-2 border-white bg-saffron-600 shadow-sm">
            <Image src="/og.png" alt="" fill priority className="object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-ink/30 text-lg font-black text-white">F</span>
          </span>
          <span className="hidden sm:block"><strong className="block text-lg leading-none">{t("brand")}</strong><span className="text-xs text-stone-500">Dhaka · ঢাকা</span></span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
          <Link href="/search" className="btn-secondary !min-h-10 !px-3 sm:!px-4"><Search size={18}/><span className="hidden md:inline">{t("search")}</span></Link>
          <button onClick={toggle} className="btn-secondary !min-h-10 !px-3" aria-label={t("language")}><Globe2 size={18}/><span className="hidden sm:inline">{t("language")}</span></button>
          {user ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full bg-leaf text-white shadow-sm" aria-expanded={open} aria-label={t("profile")}><UserRound size={19}/></button>
              {open && <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-orange-100 bg-white p-2 shadow-warm">
                <div className="border-b border-orange-100 px-3 py-2"><p className="font-bold">{user.name || user.phone}</p><p className="text-xs text-stone-500">{user.contributionPoints} pts · {user.badges.length} badges</p></div>
                <Link onClick={() => setOpen(false)} href="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-orange-50"><Award size={17}/>{t("profile")}</Link>
                <Link onClick={() => setOpen(false)} href="/vendor/add" className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-orange-50"><Plus size={17}/>{t("addMama")}</Link>
                {user.isAdmin && <Link onClick={() => setOpen(false)} href="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-orange-50"><Shield size={17}/>{t("admin")}</Link>}
                <form action="/api/auth/logout" method="post"><button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-red-700 hover:bg-red-50"><LogIn size={17}/>{t("logout")}</button></form>
              </div>}
            </div>
          ) : <Link href="/auth/login" className="btn-primary !min-h-10 !px-3 sm:!px-4"><LogIn size={18}/><span className="hidden sm:inline">{t("login")}</span></Link>}
        </nav>
      </div>
    </header>
  );
}
