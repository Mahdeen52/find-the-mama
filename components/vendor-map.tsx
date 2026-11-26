"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Rating } from "@/components/ui";
import { DHAKA_CENTER } from "@/lib/constants";
import type { Vendor } from "@/lib/types";
import { listingRating } from "@/lib/utils";

const pin = L.divIcon({ className: "", html: '<span class="vendor-map-pin" aria-hidden="true"></span>', iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -24] });

function MapViewport({ vendors, position, onChange }: {
  vendors?: Vendor[]; position?: [number, number]; onChange?: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const lat = position?.[0];
  const lng = position?.[1];
  useMapEvents({ click: (event) => onChange?.(event.latlng.lat, event.latlng.lng) });

  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], map.getZoom());
  }, [map, lat, lng]);

  useEffect(() => {
    if (vendors?.length) map.fitBounds(vendors.map((vendor) => [vendor.lat, vendor.lng]), { maxZoom: 15, padding: [26, 26] });
  }, [map, vendors]);

  return null;
}

export function VendorMap({ vendors, className = "h-[420px]", picker, position, onPositionChange }: {
  vendors?: Vendor[]; className?: string; picker?: boolean; position?: [number, number]; onPositionChange?: (lat: number, lng: number) => void;
}) {
  const common = useTranslations("Common");
  return (
    <MapContainer center={position ?? DHAKA_CENTER} zoom={picker ? 14 : 12} scrollWheelZoom={false} className={`${className} w-full rounded-xl border border-line`}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapViewport vendors={vendors} position={position} onChange={picker ? onPositionChange : undefined} />
      {picker && position && <Marker position={position} icon={pin} alt={common("map")} />}
      {vendors?.map((vendor) => {
        const rating = listingRating(vendor);
        return (
          <Marker key={vendor.id} position={[vendor.lat, vendor.lng]} icon={pin} alt={vendor.name} title={vendor.name}>
            <Popup><div className="min-w-32">
              <Link className="text-link text-base" href={`/vendor/${vendor.id}`}>{vendor.name}</Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                {vendor.area}{vendor.ratingCount > 0 && <Rating value={rating} label={common("rating", { value: rating.toFixed(1) })} />}
              </div>
            </div></Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
