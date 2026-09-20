"use client";

import { useQuery } from "@tanstack/react-query";
import { Award, Camera, ChevronRight, MapPinned, MessageSquareText, Sparkles, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { BADGE_LEVELS, POINT_RULES } from "@/lib/gamification";
import type { ProfileStats } from "@/lib/types";

const actionLabels: Record<string, string> = { add_vendor: "Listed a mama", add_review: "Shared a review", add_photo: "Added a photo", on_my_way: "Marked on the way" };

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  useEffect(() => { if (!loading && !user) router.replace("/auth/login"); }, [loading, user, router]);
  const stats = useQuery({ queryKey: ["profile-stats"], queryFn: () => api<ProfileStats>("/api/users/me/stats"), enabled: Boolean(user) });

  if (loading || !user || stats.isLoading) return <div className="container-page py-16"><div className="h-96 animate-pulse rounded-[2rem] bg-orange-100"/></div>;
  const data = stats.data;
  const next = data?.nextBadge;
  const previousTarget = [...BADGE_LEVELS].reverse().find((badge) => badge.points <= user.contributionPoints)?.points || 0;
  const progress = next ? Math.min(100, ((user.contributionPoints - previousTarget) / (next.points - previousTarget)) * 100) : 100;

  return <div className="container-page py-10 sm:py-16">
    <section className="overflow-hidden rounded-[2.25rem] bg-ink text-white shadow-warm">
      <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.2fr_.8fr] lg:p-12">
        <div><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-orange-200"><Sparkles size={16}/>Community profile</div><h1 className="text-4xl font-black sm:text-5xl">{user.name || "Fuchka Explorer"}</h1><p className="mt-3 text-stone-300">{user.phone || user.email}</p><div className="mt-8 flex items-end gap-3"><strong className="text-6xl font-black text-orange-300">{user.contributionPoints}</strong><span className="pb-2 text-lg font-bold">community points</span></div>{next ? <div className="mt-6 max-w-xl"><div className="mb-2 flex justify-between text-sm"><span>Next: {next.name}</span><span>{next.remaining} pts to go</span></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-saffron-500 transition-all" style={{ width: `${progress}%` }}/></div></div> : <p className="mt-5 font-bold text-orange-200">You unlocked every badge. Dhaka legend!</p>}</div>
        <div className="grid grid-cols-3 gap-3 self-end">{[{ icon: MapPinned, value: data?.counts.vendors || 0, label: "Listings" }, { icon: MessageSquareText, value: data?.counts.reviews || 0, label: "Reviews" }, { icon: Camera, value: data?.counts.photos || 0, label: "Photos" }].map(({ icon: Icon, value, label }) => <div key={label} className="rounded-3xl bg-white/10 p-4 text-center"><Icon className="mx-auto text-orange-300"/><strong className="mt-3 block text-2xl">{value}</strong><span className="text-xs text-stone-300">{label}</span></div>)}</div>
      </div>
    </section>

    <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <section className="card p-6 sm:p-8"><div className="flex items-center gap-3"><Award className="text-saffron-600"/><div><h2 className="text-2xl font-black">Your badges</h2><p className="text-sm text-stone-500">Every useful contribution moves you forward.</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{BADGE_LEVELS.map((badge) => { const earned = user.badges.includes(badge.id) || user.contributionPoints >= badge.points; return <div key={badge.id} className={`rounded-3xl border p-5 ${earned ? "border-orange-200 bg-orange-50" : "border-stone-200 bg-stone-50 opacity-60"}`}><div className={`grid h-11 w-11 place-items-center rounded-2xl ${earned ? "bg-saffron-600 text-white" : "bg-stone-200 text-stone-500"}`}>{badge.id === "dhaka-legend" ? <Trophy/> : <Star/>}</div><h3 className="mt-4 font-black">{badge.name}</h3><p className="mt-1 text-sm text-stone-600">{badge.description}</p><p className="mt-3 text-xs font-bold uppercase tracking-wider text-saffron-700">{badge.points} points</p></div>; })}</div></section>
      <section className="space-y-8"><div className="card p-6 sm:p-8"><h2 className="text-2xl font-black">Earn more points</h2><div className="mt-5 space-y-3">{[{ label: "List a new mama", points: POINT_RULES.add_vendor, href: "/vendor/add" }, { label: "Write your first review", points: POINT_RULES.add_review, href: "/search" }, { label: "Add a useful photo", points: POINT_RULES.add_photo, href: "/search" }].map((item) => <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-2xl border border-orange-100 p-4 transition hover:border-orange-300 hover:bg-orange-50"><span className="font-bold">{item.label}</span><span className="flex items-center gap-2 font-black text-leaf">+{item.points}<ChevronRight size={16}/></span></Link>)}</div></div>
        <div className="card p-6 sm:p-8"><h2 className="text-2xl font-black">Recent activity</h2><div className="mt-5 space-y-4">{!data?.recentActivity.length ? <p className="rounded-2xl bg-orange-50 p-4 text-sm text-stone-600">Your contributions will appear here. Start by adding a neighbourhood mama.</p> : data.recentActivity.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 border-b border-orange-100 pb-4 last:border-0 last:pb-0"><div><p className="font-bold">{actionLabels[item.action] || item.action}</p><p className="text-xs text-stone-500">{new Date(item.createdAt).toLocaleDateString("en-BD", { dateStyle: "medium" })}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-leaf">+{item.pointsEarned}</span></div>)}</div></div>
      </section>
    </div>
  </div>;
}
