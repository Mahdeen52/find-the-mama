"use client";

import { Camera, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export function PhotoUploader({ onUploaded, label, onBusyChange }: {
  onUploaded: (url: string) => void | Promise<void>; label: string; onBusyChange?: (busy: boolean) => void;
}) {
  const t = useTranslations("Vendor");
  const common = useTranslations("Common");
  const [uploading, setUploading] = useState(false);

  async function change(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    input.value = "";
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error(t("photoSize"));
      return;
    }
    const body = new FormData();
    body.append("file", file);
    setUploading(true);
    onBusyChange?.(true);
    try {
      const result = await api<{ url: string }>("/api/uploads", { method: "POST", body });
      await onUploaded(result.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : common("error"));
    } finally {
      setUploading(false);
      onBusyChange?.(false);
    }
  }

  return (
    <label className={`upload-control flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-stone-400 bg-canvas p-4 text-center text-sm font-semibold text-brand-700 ${uploading ? "cursor-wait" : "cursor-pointer hover:border-brand-600 hover:bg-brand-50"}`}>
      {uploading ? <LoaderCircle size={21} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Camera size={21} aria-hidden="true" />}
      <span role="status">{uploading ? t("uploading") : label}</span>
      <input type="file" accept="image/*" onChange={change} className="sr-only" disabled={uploading} />
    </label>
  );
}
