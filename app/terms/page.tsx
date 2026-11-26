import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Terms" };
export default function TermsPage() { return <InfoPage kind="terms" />; }
