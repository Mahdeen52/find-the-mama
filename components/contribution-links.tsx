"use client";

import Link from "next/link";
import { ArrowRight, Camera, MapPin, MessageSquareText } from "lucide-react";
import { useTranslations } from "next-intl";
import { POINT_RULES } from "@/lib/gamification";

const actions = [
  { href: "/vendor/add", label: "addMama", group: "common", icon: MapPin, points: POINT_RULES.add_vendor },
  { href: "/search", label: "addReview", group: "vendor", icon: MessageSquareText, points: POINT_RULES.add_review },
  { href: "/search", label: "addPhoto", group: "vendor", icon: Camera, points: POINT_RULES.add_photo }
] as const;

export function ContributionLinks() {
  const common = useTranslations("Common");
  const vendor = useTranslations("Vendor");
  return (
    <ul className="grid gap-3">
      {actions.map(({ href, group, label, icon: Icon, points }) => (
        <li key={label}>
          <Link href={href} className="card flex min-h-14 items-center gap-3 px-3 py-2 text-sm font-semibold hover:border-brand-100 sm:px-4">
            <Icon size={19} className="shrink-0 text-brand-700" aria-hidden="true" />
            <span className="flex-1">{group === "common" ? common(label) : vendor(label)}</span>
            <span className="chip chip-brand shrink-0">+{common("points", { count: points })}</span>
            <ArrowRight size={15} className="shrink-0 text-muted" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
