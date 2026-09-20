"use client";

import { Camera, LoaderCircle } from "lucide-react";
import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export function PhotoUploader({ onUploaded, label = "Upload photo", compact = false }: { onUploaded: (url: string) => void; label?: string; compact?: boolean }) {
  const [uploading, setUploading] = useState(false);
  const change = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { toast.error("Choose an image under 5 MB"); return; }
    const body = new FormData(); body.append("file", file); setUploading(true);
    try { const result = await api<{ url: string }>("/api/uploads", { method: "POST", body }); onUploaded(result.url); toast.success("Photo ready"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed"); }
    finally { setUploading(false); event.target.value = ""; }
  };
  return <label className={compact ? "btn-secondary cursor-pointer !px-3" : "flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 p-5 font-bold text-saffron-700 hover:border-orange-400"}>{uploading ? <LoaderCircle className="animate-spin"/> : <Camera/>}<span className={compact ? "sr-only" : "mt-2"}>{label}</span><input type="file" accept="image/*" onChange={change} className="sr-only" disabled={uploading}/></label>;
}
