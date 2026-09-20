"use client";

import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { DHAKA_CENTER } from "@/lib/constants";
import type { Vendor } from "@/lib/types";

const pin = L.divIcon({ className: "", html: '<div style="width:36px;height:36px;border-radius:18px 18px 18px 4px;transform:rotate(-45deg);background:#e85d04;border:3px solid white;box-shadow:0 5px 15px #0003;display:grid;place-items:center"><span style="transform:rotate(45deg);font-size:16px">🥣</span></div>', iconSize: [36, 36], iconAnchor: [18, 36] });
const pickerPin = L.divIcon({ className: "", html: '<div style="width:32px;height:32px;border-radius:50%;background:#24705b;border:4px solid white;box-shadow:0 4px 14px #0004"></div>', iconSize: [32, 32], iconAnchor: [16, 16] });

function MapClick({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({ click(event) { onChange(event.latlng.lat, event.latlng.lng); } });
  return null;
}

export function VendorMap({ vendors, className = "h-[460px]", picker, position, onPositionChange }: { vendors?: Vendor[]; className?: string; picker?: boolean; position?: [number, number]; onPositionChange?: (lat: number, lng: number) => void }) {
  const center = position || (vendors?.[0] ? [vendors[0].lat, vendors[0].lng] as [number, number] : DHAKA_CENTER);
  return (
    <MapContainer center={center} zoom={picker ? 13 : 12} scrollWheelZoom className={`${className} w-full rounded-3xl`}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {picker && onPositionChange && <MapClick onChange={onPositionChange}/>} 
      {picker && position && <Marker position={position} icon={pickerPin}/>} 
      {vendors?.map((vendor) => <Marker key={vendor.id} position={[vendor.lat, vendor.lng]} icon={pin}><Popup><div className="min-w-44"><strong className="text-base">{vendor.name}</strong><p className="my-1 text-sm">{vendor.area} · ★ {vendor.ratingAvg.toFixed(1)}</p><Link className="font-bold text-orange-700" href={`/vendor/${vendor.id}`}>View mama →</Link></div></Popup></Marker>)}
    </MapContainer>
  );
}
