"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ExternalLink,
  Flag,
  Image,
  MapPin,
  MessageSquare,
  Settings,
  Store,
  Users,
} from "lucide-react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/en.json";

const nav = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/photos", label: "Photos", icon: Image },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string | null; role: string };
}) {
  const path = usePathname();

  return (
    <NextIntlClientProvider
      locale="en"
      messages={messages}
      timeZone="Asia/Dhaka"
    >
      <div lang="en" className="min-w-0">
        <header className="border-b border-line bg-white">
          <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
            <Link href="/admin" className="flex items-center gap-3 rounded-lg">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
                <MapPin size={20} aria-hidden="true" />
              </span>
              <span>
                <strong className="block text-sm">Find The Mama Admin</strong>
                <span className="block text-xs text-muted">
                  {user.name || "Team member"} · {user.role}
                </span>
              </span>
            </Link>
            <Link className="btn-secondary" href="/">
              View site <ExternalLink size={16} aria-hidden="true" />
            </Link>
          </div>
        </header>
        <div className="container-page grid gap-5 py-6 lg:grid-cols-[188px_minmax(0,1fr)] lg:gap-8 lg:py-8">
          <nav
            aria-label="Admin navigation"
            className="card flex h-fit flex-wrap gap-1 p-2 lg:sticky lg:top-6 lg:flex-col"
          >
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="nav-link"
                aria-current={
                  path === href
                    ? "page"
                    : href !== "/admin" && path.startsWith(`${href}/`)
                      ? "location"
                      : undefined
                }
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
