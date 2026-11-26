"use client";

import { useQuery } from "@tanstack/react-query";
import { Award, Camera, MapPin, MessageSquareText, UserRound } from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { ContributionLinks } from "@/components/contribution-links";
import { RewardBadges } from "@/components/reward-badges";
import { SectionHeader, Skeleton, StatePanel } from "@/components/ui";
import { VendorPhoto } from "@/components/vendor-photo";
import { api } from "@/lib/api";
import { BADGE_LEVELS } from "@/lib/gamification";
import type { ProfileStats } from "@/lib/types";

const metrics = [
  { key: "vendors", label: "listings", icon: MapPin },
  { key: "reviews", label: "reviews", icon: MessageSquareText },
  { key: "photos", label: "photos", icon: Camera }
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const t = useTranslations("Profile");
  const common = useTranslations("Common");
  const home = useTranslations("Home");
  const format = useFormatter();
  const { user, loading } = useAuth();
  useEffect(() => { if (!loading && !user) router.replace("/auth/login?next=/profile"); }, [loading, user, router]);
  const stats = useQuery({ queryKey: ["profile-stats", user?.id], queryFn: () => api<ProfileStats>("/api/users/me/stats"), enabled: Boolean(user) });

  if (loading || !user) return <div className="page-section"><Skeleton className="h-80" label={common("loading")} /></div>;

  const data = stats.data;
  const points = data?.points ?? user.contributionPoints;
  const next = data?.nextBadge;
  const nextBadge = BADGE_LEVELS.find((badge) => badge.id === next?.id);
  const previousTarget = BADGE_LEVELS.reduce((target, badge) => points >= badge.points ? badge.points : target, 0);

  return (
    <div className="page-section">
      <SectionHeader page title={t("title")} description={t("description")} action={<Link className="btn-secondary" href="/rewards"><Award size={17} aria-hidden="true" />{common("rewards")}</Link>} />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="card flex items-center gap-4 p-4 sm:p-6">
          <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-50 text-brand-700">
            {user.photoUrl ? <VendorPhoto src={user.photoUrl} alt="" sizes="56px" /> : <UserRound size={25} aria-hidden="true" />}
          </div>
          <div className="min-w-0"><h2 className="card-title break-words">{user.name || t("guestName")}</h2><p className="break-words text-sm text-muted">{user.phone || user.email}</p></div>
        </section>
        <section className="card p-4 sm:p-6">
          <h2 className="card-title text-brand-700">{common("points", { count: points })}</h2>
          {next && nextBadge ? (
            <div className="mt-3">
              <div className="mb-2 flex flex-wrap justify-between gap-1 text-sm text-muted">
                <span>{t("next", { name: t(nextBadge.id) })}</span><span>{t("remaining", { count: next.remaining })}</span>
              </div>
              <progress className="h-2 w-full overflow-hidden rounded-full bg-surface [&::-moz-progress-bar]:bg-brand-600 [&::-webkit-progress-bar]:bg-surface [&::-webkit-progress-value]:bg-brand-600"
                value={Math.max(0, points - previousTarget)} max={Math.max(1, next.points - previousTarget)} aria-label={t("next", { name: t(nextBadge.id) })}
              />
            </div>
          ) : data && <p className="mt-2 text-sm text-muted">{t("allEarned")}</p>}
        </section>
      </div>
      {stats.isError ? (
        <div className="mt-4"><StatePanel title={common("errorTitle")} description={common("error")} error action={<button type="button" onClick={() => void stats.refetch()} className="btn-primary">{common("retry")}</button>} /></div>
      ) : (
        <dl className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
          {metrics.map(({ key, label, icon: Icon }) => (
            <div className="card p-3 sm:p-4" key={key}>
              <dt className="flex flex-wrap items-center gap-1.5 break-words text-xs font-semibold text-muted sm:text-sm"><Icon size={16} aria-hidden="true" />{t(label)}</dt>
              <dd className="mt-2 text-xl font-bold tabular-nums sm:text-2xl">{data ? format.number(data.counts[key]) : "—"}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="section-title mb-4">{t("badges")}</h2>
          <RewardBadges points={points} badges={data?.badges ?? user.badges} />
          <h2 className="section-title mb-4 mt-8">{home("contribute")}</h2>
          <ContributionLinks />
        </section>
        <section>
          <h2 className="section-title mb-4">{t("activity")}</h2>
          {stats.isPending && <Skeleton className="h-40" label={common("loading")} />}
          {data && !data.recentActivity.length && <p className="card p-4 text-sm text-muted">{t("empty")}</p>}
          {!!data?.recentActivity.length && (
            <ol className="card divide-y divide-line">
              {data.recentActivity.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <p className="font-semibold">{t.has(item.action) ? t(item.action) : item.action.replaceAll("_", " ")}</p>
                    <time dateTime={item.createdAt} className="text-sm text-muted">{format.dateTime(new Date(item.createdAt), { dateStyle: "medium" })}</time>
                  </div>
                  {!!item.pointsEarned && <span className="chip chip-brand">{item.pointsEarned > 0 ? "+" : ""}{common("points", { count: item.pointsEarned })}</span>}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
