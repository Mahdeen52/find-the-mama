"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, LocateFixed, MapPin, MessageSquareText, Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { ContributionLinks } from "@/components/contribution-links";
import { SearchField, useGrantedLocation, useNearbyLocation, ViewToggle, type DiscoveryView } from "@/components/discovery-controls";
import { SectionHeader } from "@/components/ui";
import { VendorResults } from "@/components/vendor-results";
import { api } from "@/lib/api";
import { AREAS } from "@/lib/constants";
import type { Vendor } from "@/lib/types";
import { listingRating } from "@/lib/utils";

type Sort = "distance" | "rating" | "area" | "recentlyAdded";

export default function HomePage() {
  const t = useTranslations("Home");
  const common = useTranslations("Common");
  const search = useTranslations("Search");
  const router = useRouter();
  const results = useRef<HTMLElement>(null);
  const [keyword, setKeyword] = useState("");
  const [area, setArea] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sort, setSort] = useState<Sort>("rating");
  const [view, setView] = useState<DiscoveryView>("list");
  const foundLocation = useCallback((position: { lat: number; lng: number }, nearest: string) => {
    setCoords(position);
    setArea(nearest);
    setSort("distance");
  }, []);
  const location = useNearbyLocation(foundLocation);
  useGrantedLocation(location.locate, !area && !coords && location.status === "idle");

  const filters = new URLSearchParams({ sort, ...(area && { area }), ...(coords && { lat: String(coords.lat), lng: String(coords.lng) }) });
  const resultUrl = coords
    ? `/api/vendors/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=20`
    : `/api/vendors?${filters}&limit=${area || view === "map" ? 50 : 3}`;
  const vendors = useQuery({ queryKey: ["vendors", resultUrl], queryFn: () => api<Vendor[]>(resultUrl) });
  const rows = coords ? [...(vendors.data ?? [])].sort((a, b) => {
    if (sort === "distance") return (a.distance ?? Infinity) - (b.distance ?? Infinity);
    if (sort === "recentlyAdded") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    const byRating = listingRating(b) - listingRating(a);
    return sort === "area" ? a.area.localeCompare(b.area) || byRating : byRating;
  }) : vendors.data ?? [];
  const featured = !coords && !area && view === "list" && sort === "rating";

  function chooseArea(value: string) {
    setArea(value);
    setCoords(null);
    if (sort === "distance") setSort("rating");
  }

  return (
    <>
      <section className="container-page grid items-center gap-8 py-8 sm:py-12 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:py-16">
        <div>
          <h1 className="hero-title max-w-xl text-[2.5rem] font-bold leading-[1.07] tracking-[-.045em] sm:text-5xl xl:text-[4rem]">{t("title")}</h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed">{t("subtitle")}</p>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">{common("description")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" disabled={location.status === "loading"} onClick={() => { location.locate(); results.current?.scrollIntoView({ block: "start" }); }}>
              <LocateFixed size={18} aria-hidden="true" />{t(location.status === "loading" ? "locating" : "nearMe")}
            </button>
            <Link href="/vendor/add" className="btn-secondary">{common("addMama")}</Link>
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface">
          <Image src="/seed/fuchka-stall-dhanmondi.png" alt={t("heroPhoto")} fill priority sizes="(max-width: 1023px) 100vw, 52vw" className="object-cover" />
        </div>
      </section>

      <section ref={results} className="container-page pb-12 lg:pb-16" id="browse">
        <div className="card p-4 sm:p-6">
          <h2 className="card-title">{t("locationTitle")}</h2>
          <form className="mt-3 flex gap-2" role="search" onSubmit={(event) => {
            event.preventDefault();
            const params = new URLSearchParams(filters);
            if (keyword.trim()) params.set("q", keyword.trim());
            router.push(`/search?${params}`);
          }}>
            <SearchField value={keyword} onChange={setKeyword} placeholder={t("placeholder")} />
            <button type="submit" className="btn-primary shrink-0">{t("find")}</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={search("area")}>
            {["", ...AREAS].map((option) => (
              <button
                type="button" key={option} aria-pressed={area === option} onClick={() => chooseArea(option)}
                className={`btn-secondary min-h-9 rounded-full px-3 ${area === option ? "border-brand-100 bg-brand-50 text-brand-700 hover:bg-brand-50" : ""}`}
              >{option || t("allAreas")}</button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted" aria-live="polite">
            {location.status === "unavailable" && <span className="mr-1 font-semibold text-brand-700">{t("locationDenied")}</span>}
            {coords && <span className="mr-1 font-semibold text-brand-700">{t("detectedArea")}: {area}.</span>}
            {t("locationBody")}
          </p>
        </div>

        <div className="my-6 sm:mt-8">
          <SectionHeader title={featured ? t("featured") : coords ? t("nearby") : t("areaResults")} description={featured ? t("featuredDescription") : undefined}
            action={<div className="flex flex-wrap gap-2">
              <select aria-label={search("sort")} value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="field w-auto text-sm">
                {coords && <option value="distance">{t("sortDistance")}</option>}
                <option value="rating">{t("sortRating")}</option>
                <option value="area">{t("sortArea")}</option>
                <option value="recentlyAdded">{t("sortRecent")}</option>
              </select>
              <ViewToggle view={view} onChange={setView} />
            </div>}
          />
        </div>
        <div aria-live="polite" className="sr-only">{!vendors.isPending && !vendors.isError && search("results", { count: rows.length })}</div>
        <VendorResults vendors={rows} loading={vendors.isPending} error={vendors.isError} retry={() => void vendors.refetch()} view={view} />
        <Link href={`/search?${filters}`} className="btn-secondary mt-6">{t("browse")}<ArrowRight size={17} aria-hidden="true" /></Link>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page py-8 sm:py-12">
          <h2 className="section-title">{t("how")}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {([
              { icon: MapPin, label: "stepSearch" }, { icon: MessageSquareText, label: "stepReview" }, { icon: Utensils, label: "stepVisit" }
            ] as const).map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 rounded-xl border border-line p-4 font-semibold">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700"><Icon size={19} aria-hidden="true" /></span>{t(label)}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="page-section grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div>
          <h2 className="section-title">{t("contribute")}</h2>
          <p className="mt-3 max-w-md text-muted">{t("contributeBody")}</p>
          <Link href="/rewards" className="btn-secondary mt-5">{common("rewards")}<ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <ContributionLinks />
      </section>
    </>
  );
}
