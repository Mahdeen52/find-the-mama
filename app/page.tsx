"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Award, Camera, List, LocateFixed, Map as MapIcon, MapPinned, MessageSquareText, Navigation, Search, Sparkles, Trophy, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { DynamicVendorMap } from "@/components/map-dynamic";
import { VendorCard } from "@/components/vendor-card";
import { api } from "@/lib/api";
import { AREA_CENTERS, AREAS } from "@/lib/constants";
import type { Vendor } from "@/lib/types";
import { haversineKm } from "@/lib/utils";

type Sort = "distance" | "rating" | "area" | "recentlyAdded";
type GeoState = "idle" | "locating" | "ready" | "denied";

function nearestArea(lat: number, lng: number) {
  return (Object.entries(AREA_CENTERS) as [typeof AREAS[number], [number, number]][])
    .sort((a, b) => haversineKm(lat, lng, a[1][0], a[1][1]) - haversineKm(lat, lng, b[1][0], b[1][1]))[0][0];
}

export default function HomePage() {
  const t = useTranslations("Home");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [sort, setSort] = useState<Sort>("distance");
  const [view, setView] = useState<"map" | "list">("map");

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setGeoState("denied"); return; }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords: location }) => {
        const detected = nearestArea(location.latitude, location.longitude);
        setCoords({ lat: location.latitude, lng: location.longitude });
        setArea(detected); setSort("distance"); setGeoState("ready");
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 }
    );
  }, []);

  useEffect(() => {
    if (!navigator.permissions?.query) return;
    navigator.permissions.query({ name: "geolocation" }).then((permission) => {
      if (permission.state === "granted") requestLocation();
    }).catch(() => undefined);
  }, [requestLocation]);

  const endpoint = coords
    ? `/api/vendors/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=20`
    : area ? `/api/vendors?limit=50&area=${encodeURIComponent(area)}` : "";
  const vendors = useQuery({ queryKey: ["vendors", endpoint], queryFn: () => api<Vendor[]>(endpoint), enabled: Boolean(endpoint) });
  const filtered = useMemo(() => {
    const rows = (vendors.data || []).filter((vendor) => !query || `${vendor.name} ${vendor.area} ${vendor.specialties.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
    return [...rows].sort((a, b) => sort === "distance" ? (a.distance ?? 999) - (b.distance ?? 999) : sort === "rating" ? b.ratingAvg - a.ratingAvg : sort === "area" ? a.area.localeCompare(b.area) || b.ratingAvg - a.ratingAvg : Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [vendors.data, query, sort]);
  const submit = (event: FormEvent) => { event.preventDefault(); window.location.href = `/search?q=${encodeURIComponent(query)}${area ? `&area=${encodeURIComponent(area)}` : ""}${coords ? `&lat=${coords.lat}&lng=${coords.lng}` : ""}`; };
  const chooseArea = (value: string) => { setArea(value); setCoords(null); setGeoState(value ? "ready" : "denied"); if (sort === "distance") setSort("rating"); };

  return <>
    <section className="relative overflow-hidden border-b border-orange-100 bg-[radial-gradient(circle_at_85%_15%,#fed7aa_0,transparent_28%),radial-gradient(circle_at_10%_90%,#fde68a_0,transparent_30%)]">
      <div className="container-page grid min-h-[570px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr]">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/70 px-4 py-2 text-sm font-bold text-saffron-700"><Sparkles size={16}/>{t("eyebrow")}</div>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">{t("title")}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">{t("subtitle")}</p>
          <form onSubmit={submit} className="mt-8 flex max-w-2xl flex-col gap-3 rounded-3xl border border-orange-100 bg-white p-3 shadow-warm sm:flex-row">
            <label className="flex flex-1 items-center gap-3 px-2"><Search className="text-saffron-600"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("placeholder")} className="min-h-12 w-full outline-none"/></label>
            <button className="btn-primary px-7">{t("find")}<ArrowRight size={18}/></button>
          </form>
          <div className="mt-8 flex flex-wrap gap-7 text-sm"><div><strong className="text-2xl">40+</strong><span className="ml-2 text-stone-500">{t("statVendors")}</span></div><div><strong className="text-2xl">10</strong><span className="ml-2 text-stone-500">{t("statAreas")}</span></div><div className="flex items-center gap-2 font-bold text-leaf"><UsersRound size={20}/>{t("statCommunity")}</div></div>
        </div>
        <div className="relative hidden lg:block"><div className="absolute -inset-5 rotate-3 rounded-[3rem] bg-saffron-500/15"/><div className="relative rounded-[2.7rem] border-8 border-white bg-ink p-7 text-white shadow-warm"><div className="mb-7 flex items-center justify-between"><div><p className="text-sm text-orange-200">Featured in Gulshan</p><p className="text-2xl font-black">Fuchka Club · Gulshan 2</p></div><LocateFixed className="text-orange-300"/></div><div className="grid grid-cols-3 gap-3">{["ঝাল", "টক", "দই"].map((flavour, i) => <div key={flavour} className="rounded-3xl bg-white/10 p-5 text-center"><div className="mb-3 text-4xl">{["🌶️", "🍋", "🥣"][i]}</div><strong>{flavour}</strong></div>)}</div><div className="mt-4 rounded-3xl bg-saffron-600 p-5"><p className="text-sm text-orange-100">Demo community favourite</p><p className="mt-1 text-xl font-black">Humour with Sultan · Fuchka Club</p><p className="mt-2 text-sm">★ 4.9 · Gulshan 2 · Featured</p></div></div></div>
      </div>
    </section>

    <section className="container-page py-16">
      <div className="mb-8 rounded-4xl bg-ink p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-2xl"><div className="flex items-center gap-2 text-orange-300"><Navigation size={20}/><span className="text-sm font-black uppercase tracking-wider">Location first</span></div><h2 className="mt-2 text-2xl font-black sm:text-3xl">{t("locationTitle")}</h2><p className="mt-2 text-stone-300">{t("locationBody")}</p>{geoState === "ready" && area && <p className="mt-3 font-bold text-orange-300">{t("detectedArea")}: {area}</p>}{geoState === "denied" && <p className="mt-3 text-amber-300">{t("locationDenied")}</p>}</div><div className="flex min-w-64 flex-col gap-3"><button onClick={requestLocation} disabled={geoState === "locating"} className="btn-primary"><LocateFixed size={18}/>{geoState === "locating" ? t("locating") : t("useLocation")}</button><select value={area} onChange={(event) => chooseArea(event.target.value)} className="field !border-white/20 !bg-white/10 !text-white"><option className="text-ink" value="">{t("allAreas")}</option>{AREAS.map((item) => <option className="text-ink" key={item}>{item}</option>)}</select></div></div>
      </div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-3xl font-black sm:text-4xl">{t("nearby")}</h2><p className="mt-2 text-stone-500">{t("nearbySub")}</p></div><div className="flex flex-wrap gap-2"><select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="field !min-h-11 !w-auto !py-2"><option value="distance" disabled={!coords}>{t("sortDistance")}</option><option value="rating">{t("sortRating")}</option><option value="area">{t("sortArea")}</option><option value="recentlyAdded">{t("sortRecent")}</option></select><div className="flex rounded-full border border-orange-200 bg-white p-1"><button onClick={() => setView("map")} className={`flex items-center gap-2 rounded-full px-4 py-2 font-bold ${view === "map" ? "bg-ink text-white" : ""}`}><MapIcon size={17}/>{t("map")}</button><button onClick={() => setView("list")} className={`flex items-center gap-2 rounded-full px-4 py-2 font-bold ${view === "list" ? "bg-ink text-white" : ""}`}><List size={17}/>{t("list")}</button></div></div></div>
      <div className="mt-8">{!endpoint ? <div className="card p-12 text-center"><LocateFixed className="mx-auto text-saffron-600" size={36}/><p className="mt-4 font-bold">{t("locationTitle")}</p></div> : vendors.isLoading ? <div className="h-[460px] animate-pulse rounded-3xl bg-orange-100"/> : !filtered.length ? <div className="card p-16 text-center text-stone-500">{t("empty")}</div> : view === "map" ? <DynamicVendorMap vendors={filtered}/> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((vendor) => <VendorCard key={vendor.id} vendor={vendor}/>)}</div>}</div>
      <div className="mt-10 text-center"><Link href={`/search${area ? `?area=${encodeURIComponent(area)}` : ""}`} className="btn-secondary">{t("find")}<ArrowRight size={18}/></Link></div>
    </section>
    <section className="border-y border-orange-100 bg-white py-16">
      <div className="container-page grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div><div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-leaf"><Award size={17}/>Community rewards</div><h2 className="mt-5 text-3xl font-black sm:text-4xl">Map Dhaka. Earn points. Become a neighbourhood legend.</h2><p className="mt-4 max-w-xl leading-7 text-stone-600">Useful listings, honest reviews and clear photos all earn points. Your profile keeps every badge and contribution in one place.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/vendor/add" className="btn-primary"><MapPinned size={18}/>List a mama · +20</Link><Link href="/profile" className="btn-secondary"><Trophy size={18}/>View my profile</Link></div></div>
        <div className="grid gap-4 sm:grid-cols-3">{[{ icon: MapPinned, points: "+20", title: "Add a mama", text: "Pin a cart and share the essentials." }, { icon: MessageSquareText, points: "+5", title: "Write a review", text: "Rate taste, hygiene and value." }, { icon: Camera, points: "+3", title: "Add a photo", text: "Help others recognise the right cart." }].map(({ icon: Icon, points, title, text }) => <div key={title} className="card p-6"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100 text-saffron-700"><Icon/></span><strong className="text-xl text-leaf">{points}</strong></div><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-500">{text}</p></div>)}</div>
      </div>
    </section>
  </>;
}
