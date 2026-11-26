import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Contact" };
export default function ContactPage() { return <InfoPage kind="contact" />; }
