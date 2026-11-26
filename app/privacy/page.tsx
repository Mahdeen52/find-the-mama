import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Privacy" };
export default function PrivacyPage() { return <InfoPage kind="privacy" />; }
