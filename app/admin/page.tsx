"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Flag, Store, Trash2, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

type Stats = { vendors: number; users: number; reports: number; byArea: { area: string; count: number }[]; rows: { id: string; name: string; area: string; ratingAvg: number; status: string }[] };
export default function AdminPage() {
  const t = useTranslations("Admin"); const { user, loading } = useAuth(); const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin-stats"], queryFn: () => api<Stats>("/api/admin/stats"), enabled: Boolean(user?.isAdmin) });
  if (loading) return <div className="container-page py-20"><div className="h-80 animate-pulse rounded-3xl bg-orange-100"/></div>;
  if (!user?.isAdmin) return <div className="container-page grid min-h-[60vh] place-items-center"><div className="card p-10 text-center"><Flag className="mx-auto text-red-500"/><h1 className="mt-4 text-3xl font-black">{t("forbidden")}</h1></div></div>;
  const remove = async (id: string) => { if (!confirm(t("confirm"))) return; try { await api(`/api/vendors/${id}`, { method: "DELETE" }); await client.invalidateQueries({ queryKey: ["admin-stats"] }); toast.success("Vendor deleted"); } catch (error) { toast.error(error instanceof Error ? error.message : "Delete failed"); } };
  const data = query.data;
  return <div className="container-page py-12"><h1 className="text-4xl font-black sm:text-5xl">{t("title")}</h1><p className="mt-3 text-stone-600">{t("subtitle")}</p><div className="mt-8 grid gap-4 sm:grid-cols-3">{[[Store,t("vendors"),data?.vendors],[UsersRound,t("users"),data?.users],[Flag,t("reports"),data?.reports]].map(([Icon,label,value]) => { const C = Icon as typeof Store; return <div key={String(label)} className="card p-6"><C className="text-saffron-600"/><p className="mt-5 text-4xl font-black">{String(value ?? "—")}</p><p className="text-stone-500">{String(label)}</p></div>; })}</div><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]"><section className="card overflow-hidden"><h2 className="p-6 text-2xl font-black">{t("listing")}</h2><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-orange-50 text-sm"><tr><th className="p-4">Name</th><th className="p-4">Area</th><th className="p-4">Rating</th><th className="p-4">{t("status")}</th><th className="p-4"></th></tr></thead><tbody>{data?.rows.map((row) => <tr key={row.id} className="border-t border-orange-100"><td className="p-4 font-bold"><Link href={`/vendor/${row.id}`}>{row.name}</Link></td><td className="p-4">{row.area}</td><td className="p-4">★ {row.ratingAvg.toFixed(1)}</td><td className="p-4"><span className="chip">{row.status}</span></td><td className="p-4"><button onClick={() => remove(row.id)} className="text-red-600"><Trash2 size={18}/></button></td></tr>)}</tbody></table></div></section><aside className="card h-fit p-6"><h2 className="flex items-center gap-2 text-xl font-black"><BarChart3/>{t("areaBreakdown")}</h2><div className="mt-5 space-y-3">{data?.byArea.map((item) => <div key={item.area} className="flex justify-between border-b border-orange-100 pb-2"><span>{item.area}</span><b>{item.count}</b></div>)}</div></aside></div></div>;
}
