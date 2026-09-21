"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  return <div className="min-h-screen">{!admin && <Header/>}<main>{children}</main>{!admin && <Footer/>}</div>;
}
