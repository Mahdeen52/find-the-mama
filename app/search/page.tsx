"use client";

import { useQuery } from "@tanstack/react-query";
import { LocateFixed, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { VendorCard } from "@/components/vendor-card";
import { api } from "@/lib/api";
import { AREA_CENTERS, AREAS, PRICE_RANGES, SPECIALTIES } from "@/lib/constants";
import type { Vendor } from "@/lib/types";
import { haversineKm } from "@/lib/utils";

function SearchContent() {
  const t = useTranslations("Search");
  const common = useTranslations("Common");
  const params = useSearchParams();
  const [area, setArea] = useState(params.get("area") || "");
  const [minRating, setMinRating] = useState(params.get("minRating") || "");
  const [price, setPrice] = useState(params.get("priceRange") || "");
  const [openNow, setOpenNow] = useState(params.get("openNow") === "true");
  const [specialties, setSpecialties] = useState<string[]>(params.get("specialties")?.split(",").filter(Boolean) || []);
  const [sort, setSort] = useState(params.get("sort") || "rating");
  const [search, setSearch] = useState(params.get("q") || "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => params.has("lat") && params.has("lng") ? { lat: Number(params.get("lat")), lng: Number(params.get("lng")) } : null);
  const [applied, setApplied] = useState(0);
  useEffect(() => { if (coords || !navigator.geolocation) return; navigator.geolocation.getCurrentPosition(({ coords: current }) => { const closest = (Object.entries(AREA_CENTERS) as [string, [number, number]][]).sort((a,b) => haversineKm(current.latitude,current.longitude,a[1][0],a[1][1]) - haversineKm(current.latitude,current.longitude,b[1][0],b[1][1]))[0][0]; setCoords({ lat: current.latitude, lng: current.longitude }); if (!area) setArea(closest); setApplied((value) => value + 1); }, () => undefined, { timeout: 8000, maximumAge: 300000 }); }, []);
  const queryString = new URLSearchParams({ ...(area && { area }), ...(minRating && { minRating }), ...(price && { priceRange: price }), ...(openNow && { openNow: "true" }), ...(specialties.length && { specialties: specialties.join(",") }), ...(coords && { lat: String(coords.lat), lng: String(coords.lng) }), sort, ...(search && { q: search }), limit: "50" }).toString();
  const query = useQuery({ queryKey: ["search", queryString, applied], queryFn: () => api<Vendor[]>(`/api/vendors?${queryString}`) });
  const submit = (event: FormEvent) => { event.preventDefault(); window.history.replaceState(null, "", `/search?${queryString}`); setApplied((value) => value + 1); };
  const clear = () => { setArea(""); setMinRating(""); setPrice(""); setOpenNow(false); setSpecialties([]); setSearch(""); setApplied((value) => value + 1); };
  return <div className="container-page py-12"><div className="mb-10 max-w-2xl"><h1 className="text-4xl font-black sm:text-5xl">{t("title")}</h1><p className="mt-3 text-lg text-stone-600">{t("subtitle")}</p></div><div className="grid gap-8 lg:grid-cols-[300px_1fr]">
    <form onSubmit={submit} className="card h-fit space-y-6 p-6 lg:sticky lg:top-24"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-black"><SlidersHorizontal size={20}/>{t("filters")}</h2><button type="button" onClick={clear} className="text-sm font-bold text-saffron-700">{t("clear")}</button></div><label><span className="label">{t("area")}</span><select className="field" value={area} onChange={(e) => setArea(e.target.value)}><option value="">All Dhaka</option>{AREAS.map((item) => <option key={item}>{item}</option>)}</select></label><label><span className="label">{t("rating")}</span><select className="field" value={minRating} onChange={(e) => setMinRating(e.target.value)}><option value="">Any rating</option>{[4.5,4,3.5,3].map((rating) => <option key={rating} value={rating}>{rating}+ ★</option>)}</select></label><label><span className="label">{t("price")}</span><select className="field" value={price} onChange={(e) => setPrice(e.target.value)}><option value="">Any price</option>{PRICE_RANGES.map((item, i) => <option key={item} value={item}>{"৳".repeat(i+1)} · {item.toLowerCase()}</option>)}</select></label><div><span className="label">{t("specialties")}</span><div className="space-y-2">{SPECIALTIES.map((item) => <label key={item} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={specialties.includes(item)} onChange={() => setSpecialties((list) => list.includes(item) ? list.filter((value) => value !== item) : [...list, item])} className="h-4 w-4 accent-orange-600"/>{item}</label>)}</div></div><label className="flex items-center gap-3 font-bold"><input type="checkbox" checked={openNow} onChange={(e) => setOpenNow(e.target.checked)} className="h-5 w-5 accent-orange-600"/>{common("openNow")}</label><button className="btn-primary w-full">{t("apply")}</button></form>
    <div><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="font-bold">{query.data?.length || 0} {t("results")}{coords && <span className="ml-2 text-sm font-normal text-leaf"><LocateFixed className="inline" size={15}/> location on</span>}</p><div className="flex flex-wrap gap-2"><input value={search} onChange={(e) => setSearch(e.target.value)} className="field !min-h-10 !py-2" placeholder="Name or keyword"/><select value={sort} onChange={(e) => { setSort(e.target.value); setApplied((v) => v + 1); }} className="field !min-h-10 !w-auto !py-2"><option value="rating">{t("topRated")}</option><option value="area">{t("area")} A–Z</option><option value="recentlyAdded">{t("recent")}</option><option value="distance" disabled={!coords}>{t("distance")}</option></select></div></div>{query.isLoading ? <div className="grid gap-6 sm:grid-cols-2"><div className="h-96 animate-pulse rounded-3xl bg-orange-100"/><div className="h-96 animate-pulse rounded-3xl bg-orange-100"/></div> : <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{query.data?.map((vendor) => <VendorCard key={vendor.id} vendor={vendor}/>)}</div>}</div>
  </div></div>;
}

export default function SearchPage() { return <Suspense><SearchContent/></Suspense>; }
