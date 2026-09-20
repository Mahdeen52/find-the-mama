"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Photo } from "@/lib/types";

export function VendorGallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [index, setIndex] = useState(0);
  if (!photos.length) return <div className="grid aspect-[16/8] place-items-center rounded-4xl bg-orange-100 text-7xl">🥣</div>;
  return <div className="relative aspect-[16/9] overflow-hidden rounded-4xl bg-orange-100 sm:aspect-[16/7]"><Image src={photos[index].photoUrl} alt={photos[index].caption || name} fill priority className="object-cover" sizes="100vw"/><div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"/>{photos.length > 1 && <><button onClick={() => setIndex((index - 1 + photos.length) % photos.length)} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90"><ChevronLeft/></button><button onClick={() => setIndex((index + 1) % photos.length)} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90"><ChevronRight/></button><span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">{index + 1} / {photos.length}</span></>}</div>;
}
