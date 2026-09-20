import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Find The Mama — Dhaka Fuchka Map", template: "%s | Find The Mama" },
  description: "Discover, review and support Dhaka's best neighbourhood fuchkawalas.",
  openGraph: { title: "Find The Mama", description: "Dhaka's community-powered fuchka map.", type: "website", locale: "bn_BD", images: [{ url: "/og.png", width: 1536, height: 1024, alt: "A dedicated fuchka stall in Gulshan, Dhaka" }] },
  twitter: { card: "summary_large_image", title: "Find The Mama", description: "Dhaka's community-powered fuchka map.", images: ["/og.png"] }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="bn"><body><Providers><div className="min-h-screen"><Header/><main>{children}</main><Footer/></div></Providers></body></html>;
}
