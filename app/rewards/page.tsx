"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth-provider";
import { ContributionLinks } from "@/components/contribution-links";
import { RewardBadges } from "@/components/reward-badges";
import { SectionHeader } from "@/components/ui";

export default function RewardsPage() {
  const common = useTranslations("Common");
  const home = useTranslations("Home");
  const t = useTranslations("Profile");
  const { user, loading } = useAuth();

  return (
    <div className="page-section">
      <SectionHeader page title={common("rewards")} description={t("rewardsDescription")}
        action={!loading && (
          <Link className="btn-primary" href={user ? "/profile" : "/auth/login?next=/rewards"}>
            {user ? common("profile") : common("login")}<ArrowRight size={17} aria-hidden="true" />
          </Link>
        )}
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="section-title mb-4">{home("contribute")}</h2>
          <ContributionLinks />
        </section>
        <section>
          <h2 className="section-title mb-4">{user ? t("badges") : t("availableBadges")}</h2>
          <RewardBadges points={user?.contributionPoints} badges={user?.badges} />
          {!loading && !user && <p className="mt-4 text-sm text-muted">{t("signIn")}</p>}
        </section>
      </div>
    </div>
  );
}
