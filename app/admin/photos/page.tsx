"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AdminDialog } from "@/components/admin/admin-dialog";
import { api } from "@/lib/api";

type Photo = { id: string; photoUrl: string; caption: string | null; isHidden: boolean; isInappropriate: boolean; createdAt: string; vendor: { name: string }; user: { name: string | null } };
export default function PhotosPage() {
  const [flagged, setFlagged] = useState(false); const [deleting, setDeleting] = useState<Photo | null>(null);
  const query = useQuery({ queryKey: ["admin-photos", flagged], queryFn: () => api<{items: Photo[]; total: number}>(`/api/admin/photos?flagged=${flagged || ""}`) });
  const act = async (photo: Photo, action: string, reason = `Admin ${action}`) => { try { await api(`/api/admin/photos/${photo.id}/moderate`, { method: "POST", body: JSON.stringify({ action, reason }) }); toast.success("Photo updated"); await query.refetch(); } catch (error) { toast.error(error instanceof Error ? error.message : "Action failed"); throw error; } };
  return <div><div className="flex items-end justify-between"><div><h1 className="text-4xl font-black">Photos</h1><p className="mt-2 text-stone-600">Review recent and reported community uploads.</p></div><label className="flex gap-2"><input type="checkbox" checked={flagged} onChange={(event) => setFlagged(event.target.checked)}/>Flagged only</label></div><div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{query.data?.items.map((photo) => <article className="card overflow-hidden" key={photo.id}><div className="relative aspect-video bg-orange-50"><Image fill className="object-cover" src={photo.photoUrl} alt={photo.caption || "Community upload"}/></div><div className="p-4"><div className="flex justify-between gap-2"><b>{photo.vendor.name}</b><span className="text-xs text-stone-500">{photo.user.name || "Unknown"}</span></div><p className="mt-1 text-sm text-stone-600">{photo.caption || "No caption"}</p><p className="mt-2 text-xs">{photo.isInappropriate ? "Inappropriate" : photo.isHidden ? "Hidden" : "Visible"}</p><div className="mt-3 flex gap-3 text-sm font-bold"><button onClick={() => void act(photo, photo.isHidden ? "show" : "hide")}>{photo.isHidden ? "Show" : "Hide"}</button><button className="text-amber-700" onClick={() => void act(photo, photo.isInappropriate ? "appropriate" : "inappropriate")}>{photo.isInappropriate ? "Mark appropriate" : "Inappropriate"}</button><button className="text-red-700" onClick={() => setDeleting(photo)}>Delete</button></div></div></article>)}</div>
    <AdminDialog open={Boolean(deleting)} title="Delete photo?" description={`Permanently remove this upload from ${deleting?.vendor.name || "the vendor"}.`} confirmLabel="Delete photo" danger onClose={() => setDeleting(null)} onSubmit={async (values) => { if (deleting) await act(deleting, "delete", values.reason); }} fields={[{ name: "reason", label: "Reason", type: "textarea", required: true }]}/>
  </div>;
}
