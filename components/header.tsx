"use client";

import Link from "next/link";
import { Award, Globe2, Map, MapPin, Menu, Plus, Search, Shield, UserRound, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { LocaleContext } from "@/app/providers";
import { useAuth } from "@/components/auth-provider";

export function Brand() {
  return (
    <Link href="/" className="inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg font-bold text-ink">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white"><MapPin size={21} aria-hidden="true" /></span>
      <span>Find The Mama</span>
    </Link>
  );
}

const coreLinks = [
  { href: "/search", label: "search", icon: Search },
  { href: "/vendor/add", label: "addMama", icon: Plus },
  { href: "/rewards", label: "rewards", icon: Award }
] as const;

export function Header() {
  const t = useTranslations("Common");
  const { toggle } = useContext(LocaleContext);
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const staff = user?.role === "ADMIN" || user?.role === "MODERATOR";
  const account = { href: user ? "/profile" : "/auth/login", label: user ? "profile" : "loginSignup" } as const;
  const active = (href: string) => pathname === href ? "page" : undefined;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="container-page flex h-[68px] items-center justify-between gap-2">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex" aria-label={t("mainNav")}>
          {coreLinks.map(({ href, label }) => <Link key={href} href={href} className="nav-link" aria-current={active(href)}>{t(label)}</Link>)}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={toggle} className="btn-ghost px-2 sm:px-3"><Globe2 size={17} aria-hidden="true" />{t("language")}</button>
          {!user && <Link href={account.href} className="btn-primary hidden md:inline-flex" aria-current={active(account.href)}>{t(account.label)}</Link>}
          <div className="relative" ref={menu}>
            <button type="button" ref={trigger} onClick={() => setOpen(!open)} className={`btn-icon ${user ? "" : "md:hidden"}`} aria-expanded={open} aria-controls={open ? "header-menu" : undefined} aria-label={t(open ? "close" : user ? "profile" : "menu")}>
              {open ? <X size={21} aria-hidden="true" /> : user ? <UserRound size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
            </button>
            {open && <nav id="header-menu" aria-label={t("menu")} className="card absolute right-0 top-12 grid w-60 max-w-[calc(100vw-2rem)] gap-1 p-2 shadow-raised">
              {user && <p className="break-words border-b border-line px-3 py-2 font-semibold">{user.name || user.phone || user.email}</p>}
              {coreLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className="nav-link md:hidden" aria-current={active(href)}><Icon size={17} aria-hidden="true" />{t(label)}</Link>)}
              <Link href={account.href} onClick={() => setOpen(false)} className="nav-link" aria-current={active(account.href)}><UserRound size={17} aria-hidden="true" />{t(account.label)}</Link>
              {staff && <Link href="/admin" className="nav-link"><Shield size={17} aria-hidden="true" />{t("admin")}</Link>}
              {user && <form action="/api/auth/logout" method="post"><button className="btn-ghost w-full justify-start text-red-700">{t("logout")}</button></form>}
            </nav>}
          </div>
        </div>
      </div>
    </header>
  );
}

export function MobileNavigation() {
  const t = useTranslations("Common");
  const { user } = useAuth();
  const pathname = usePathname();
  const params = useSearchParams();
  const onSearch = pathname === "/search";
  const map = onSearch && params.get("view") === "map";
  const search = new URLSearchParams(onSearch ? params : undefined);
  search.delete("view");
  const discover = search.size ? `/search?${search}` : "/search";
  search.set("view", "map");
  const links = [
    { ...coreLinks[0], href: discover }, { href: `/search?${search}`, label: "map", icon: Map },
    ...coreLinks.slice(1), { href: user ? "/profile" : "/auth/login", label: "profile", icon: UserRound }
  ] as const;

  return (
    <nav aria-label={t("quickNav")} className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white px-2 pb-[env(safe-area-inset-bottom)] shadow-card md:hidden">
      {links.map(({ href, label, icon: Icon }) => {
        const active = label === "map" ? map : label === "search" ? onSearch && !map : pathname === href;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className="nav-link min-w-0 flex-col justify-center gap-1 px-1 py-2 text-center text-[11px] leading-snug">
            <Icon size={18} aria-hidden="true" />{t(label)}
          </Link>
        );
      })}
    </nav>
  );
}
