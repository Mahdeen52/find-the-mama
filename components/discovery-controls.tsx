"use client";

import { List, Map as MapIcon, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { AREA_CENTERS } from "@/lib/constants";
import { haversineKm } from "@/lib/utils";

type Coordinates = { lat: number; lng: number };
export type DiscoveryView = "map" | "list";

export function useNearbyLocation(onFound: (coords: Coordinates, area: string) => void) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        const [area] = Object.entries(AREA_CENTERS).sort(([, a], [, b]) => haversineKm(lat, lng, ...a) - haversineKm(lat, lng, ...b))[0];
        onFound({ lat, lng }, area);
        setStatus("ready");
      },
      () => setStatus("unavailable"),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 }
    );
  }, [onFound]);

  return { locate, status };
}

export function useGrantedLocation(locate: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !navigator.permissions?.query) return;
    let current = true;
    navigator.permissions.query({ name: "geolocation" }).then((permission) => {
      if (current && permission.state === "granted") locate();
    }).catch(() => undefined);
    return () => { current = false; };
  }, [enabled, locate]);
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const t = useTranslations("Home");
  return (
    <label className="relative min-w-0 flex-1">
      <span className="sr-only">{t("find")}</span>
      <Search size={19} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input type="search" className="field pl-10" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function ViewToggle({ view, onChange }: { view: DiscoveryView; onChange: (view: DiscoveryView) => void }) {
  const t = useTranslations("Common");
  return (
    <div className="inline-flex shrink-0 items-center rounded-lg border border-line bg-white p-1">
      {([{ key: "list", icon: List }, { key: "map", icon: MapIcon }] as const).map(({ key, icon: Icon }) => (
        <button type="button" key={key} onClick={() => onChange(key)} aria-pressed={view === key} className={`btn-ghost min-h-9 rounded-md px-2.5 ${view === key ? "bg-brand-50 text-brand-700 hover:bg-brand-50" : ""}`}>
          <Icon size={17} aria-hidden="true" />{t(key)}
        </button>
      ))}
    </div>
  );
}
