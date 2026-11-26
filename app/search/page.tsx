"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { LocateFixed, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { SearchField, useGrantedLocation, useNearbyLocation, ViewToggle, type DiscoveryView } from "@/components/discovery-controls";
import { SectionHeader, Skeleton } from "@/components/ui";
import { VendorResults } from "@/components/vendor-results";
import { api } from "@/lib/api";
import { AREAS, PRICE_RANGES, SPECIALTIES } from "@/lib/constants";
import type { Vendor } from "@/lib/types";

const PAGE_SIZE = 24;

function readFilters(params: URLSearchParams) {
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const hasCoords = params.has("lat") && params.has("lng") && Number.isFinite(lat) && Number.isFinite(lng);
  return {
    area: params.get("area") || "",
    minRating: params.get("minRating") || "",
    price: params.get("priceRange") || "",
    openNow: params.get("openNow") === "true",
    specialties: params.get("specialties")?.split(",").filter(Boolean) || [],
    sort: params.get("sort") || "rating",
    search: params.get("q") || "",
    coords: hasCoords ? { lat, lng } : null
  };
}

function SearchContent() {
  const t = useTranslations("Search");
  const common = useTranslations("Common");
  const home = useTranslations("Home");
  const params = useSearchParams();
  const view: DiscoveryView = params.get("view") === "map" ? "map" : "list";
  const [filters, setFilters] = useState(() => readFilters(params));
  const [expanded, setExpanded] = useState(false);
  const filterTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => setFilters(readFilters(params)), [params]);
  const { area, minRating, price, openNow, specialties, sort, search, coords } = filters;

  const update = (patch: Partial<typeof filters>) => setFilters((current) => ({ ...current, ...patch }));
  const onFound = useCallback((position: { lat: number; lng: number }, closest: string) => {
    setFilters((current) => ({ ...current, coords: position, area: current.area || closest, sort: "distance" }));
  }, []);
  const location = useNearbyLocation(onFound);
  useGrantedLocation(location.locate, !coords && !area && !search && location.status === "idle");

  const queryParams = new URLSearchParams({
    ...(area && { area }), ...(minRating && { minRating }), ...(price && { priceRange: price }),
    ...(openNow && { openNow: "true" }), ...(specialties.length && { specialties: specialties.join(",") }),
    ...(coords && { lat: String(coords.lat), lng: String(coords.lng) }),
    sort, ...(search.trim() && { q: search.trim() })
  });
  const queryString = queryParams.toString();
  const query = useInfiniteQuery({
    queryKey: ["search", queryString, view],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => api<Vendor[]>(`/api/vendors?${queryString}&offset=${pageParam}&limit=${view === "map" ? 50 : PAGE_SIZE + 1}`),
    getNextPageParam: (lastPage, pages) => view === "list" && lastPage.length > PAGE_SIZE ? pages.length * PAGE_SIZE : undefined
  });
  const vendors = Array.from(new Map(query.data?.pages.flatMap((page) => (
    view === "map" ? page : page.slice(0, PAGE_SIZE)
  )).map((vendor) => [vendor.id, vendor])).values());

  const syncUrl = (nextView = view, nextParams = queryParams) => {
    const pathParams = new URLSearchParams(nextParams);
    if (nextView === "map") pathParams.set("view", "map");
    window.history.replaceState(null, "", pathParams.size ? `/search?${pathParams}` : "/search");
  };

  const clear = () => {
    const cleared = new URLSearchParams();
    if (coords) { cleared.set("lat", String(coords.lat)); cleared.set("lng", String(coords.lng)); }
    if (sort !== "distance" || coords) cleared.set("sort", sort);
    setFilters(readFilters(cleared));
    syncUrl(view, cleared);
  };

  return (
    <div className="page-section">
      <SectionHeader page title={t("title")} description={t("subtitle")} />
      <form className="mt-6 flex gap-2" role="search" onSubmit={(event) => { event.preventDefault(); syncUrl(); }}>
        <SearchField value={search} onChange={(value) => update({ search: value })} placeholder={t("placeholder")} />
        <button type="submit" className="btn-primary shrink-0">{home("find")}</button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button type="button" className="btn-ghost px-2 text-brand-700" onClick={location.locate} disabled={location.status === "loading"}>
          <LocateFixed size={17} aria-hidden="true" />{home(location.status === "loading" ? "locating" : "useLocation")}
        </button>
        <p className="text-sm text-muted" aria-live="polite">{location.status === "unavailable" ? home("locationDenied") : home("locationBody")}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        <div>
          <button ref={filterTrigger} type="button" aria-expanded={expanded} aria-controls="search-filters" onClick={() => setExpanded(!expanded)} className="btn-secondary w-full justify-start lg:hidden">
            <SlidersHorizontal size={18} aria-hidden="true" />{t("filters")}
          </button>
          <form id="search-filters" onSubmit={(event) => { event.preventDefault(); syncUrl(); setExpanded(false); if (expanded) filterTrigger.current?.focus(); }} className={`card mt-3 space-y-4 p-4 lg:mt-0 lg:block ${expanded ? "block" : "hidden"}`}>
            <div className="flex flex-wrap items-center justify-between gap-x-2">
              <h2 className="card-title">{t("filters")}</h2>
              <button type="button" onClick={clear} className="btn-ghost px-1 text-xs text-brand-700">{t("clear")}</button>
            </div>
            <label className="block"><span className="label">{t("area")}</span><select className="field" value={area} onChange={(event) => update({ area: event.target.value })}><option value="">{home("allAreas")}</option>{AREAS.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="block"><span className="label">{t("rating")}</span><select className="field" value={minRating} onChange={(event) => update({ minRating: event.target.value })}><option value="">{t("anyRating")}</option>{[4.5, 4, 3.5, 3].map((value) => <option key={value} value={value}>{t("minimumStars", { value })}</option>)}</select></label>
            <label className="block"><span className="label">{t("price")}</span><select className="field" value={price} onChange={(event) => update({ price: event.target.value })}><option value="">{t("anyPrice")}</option>{PRICE_RANGES.map((item) => <option key={item} value={item}>{common(item.toLowerCase() as "budget" | "moderate" | "premium")}</option>)}</select></label>
            <fieldset>
              <legend className="label">{t("specialties")}</legend>
              {SPECIALTIES.map((item) => <label key={item} className="flex min-h-9 items-center gap-2 text-sm"><input type="checkbox" checked={specialties.includes(item)} onChange={() => update({ specialties: specialties.includes(item) ? specialties.filter((value) => value !== item) : [...specialties, item] })} className="h-4 w-4" />{item}</label>)}
            </fieldset>
            <label className="flex min-h-9 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={openNow} onChange={(event) => update({ openNow: event.target.checked })} className="h-4 w-4" />{common("openNow")}</label>
            <button type="submit" className="btn-primary w-full">{t("apply")}</button>
          </form>
        </div>
        <section className="min-w-0" aria-label={t("title")}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold" role="status">
              {query.data ? t(query.hasNextPage ? "showing" : "results", { count: vendors.length }) : query.isPending ? common("loading") : ""}
              {coords && <span className="ml-2 text-brand-700">· {t("locationOn")}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              <select className="field w-auto text-sm" aria-label={t("sort")} value={sort === "distance" && !coords ? "rating" : sort} onChange={(event) => update({ sort: event.target.value })}>
                <option value="rating">{t("topRated")}</option><option value="area">{home("sortArea")}</option><option value="recentlyAdded">{t("recent")}</option>
                {coords && <option value="distance">{home("sortDistance")}</option>}
              </select>
              <ViewToggle view={view} onChange={(next) => syncUrl(next)} />
            </div>
          </div>
          <VendorResults vendors={vendors} loading={query.isPending} error={query.isError && !query.data} retry={() => void query.refetch()} view={view} columns={2} />
          {query.hasNextPage && <div className="mt-6 text-center">
            {query.isFetchNextPageError && <p role="alert" className="mb-2 text-sm text-red-700">{common("error")}</p>}
            <button type="button" className="btn-secondary" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>
              {query.isFetchingNextPage ? common("loading") : t("loadMore")}
            </button>
          </div>}
        </section>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="page-section"><Skeleton className="h-80" /></div>}><SearchContent /></Suspense>;
}
