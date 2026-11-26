"use client";

import { Award, Check, LockKeyhole } from "lucide-react";
import { useTranslations } from "next-intl";
import { BADGE_LEVELS } from "@/lib/gamification";

export function RewardBadges({ points, badges = [] }: { points?: number; badges?: string[] }) {
  const t = useTranslations("Profile");
  const common = useTranslations("Common");

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {BADGE_LEVELS.map((badge) => {
        const earned = points !== undefined && (badges.includes(badge.id) || points >= badge.points);
        const Icon = earned ? Check : points === undefined ? Award : LockKeyhole;
        return (
          <li key={badge.id} className={`card flex min-w-0 gap-3 p-4 ${earned ? "border-brand-100" : ""}`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${earned ? "bg-brand-50 text-brand-700" : "bg-surface text-muted"}`}><Icon size={20} aria-hidden="true" /></span>
            <div className="min-w-0">
              <h3 className="break-words font-semibold">{t(badge.id)}</h3>
              <p className="mt-1 text-sm text-muted">{common("points", { count: badge.points })}{earned && ` · ${t("earned")}`}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
