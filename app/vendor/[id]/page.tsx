"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Clock3, Edit3, Flag, MapPin, Navigation, Phone, Share2, Star, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth-provider";
import { PhotoUploader } from "@/components/photo-uploader";
import { ReviewForm } from "@/components/review-form";
import { VendorGallery } from "@/components/vendor-gallery";
import { api } from "@/lib/api";
import type { Review, Vendor } from "@/lib/types";
import { isOpenNow } from "@/lib/utils";

export default function VendorPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("Vendor"); const common = useTranslations("Common");
  const { user } = useAuth(); const client = useQueryClient();
  const vendor = useQuery({ queryKey: ["vendor", id], queryFn: () => api<Vendor>(`/api/vendors/${id}`) });
  const coming = useQuery({ queryKey: ["on-my-way", id], queryFn: () => api<{ count: number }>(`/api/vendors/${id}/on-my-way`), refetchInterval: 10_000 });
  if (vendor.isLoading) return <div className="container-page py-12"><div className="h-[500px] animate-pulse rounded-4xl bg-orange-100"/></div>;
  if (!vendor.data) return <div className="container-page py-20 text-center">Vendor not found</div>;
  const data = vendor.data; const open = isOpenNow(data.operatingHours);
  const onMyWay = async () => { if (!user) { window.location.href = "/auth/login"; return; } try { const result = await api<{ count: number }>(`/api/vendors/${id}/on-my-way`, { method: "POST" }); client.setQueryData(["on-my-way", id], result); toast.success(t("notified")); } catch (error) { toast.error(error instanceof Error ? error.message : common("error")); } };
  const addPhoto = async (url: string) => { try { await api(`/api/vendors/${id}/photos`, { method: "POST", body: JSON.stringify({ photoUrl: url }) }); await vendor.refetch(); toast.success("Photo added"); } catch (error) { toast.error(error instanceof Error ? error.message : common("error")); } };
  const share = async () => { const payload = { title: data.name, url: location.href }; if (navigator.share) await navigator.share(payload); else { await navigator.clipboard.writeText(location.href); toast.success(t("copied")); } };
  const today = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()]; const schedule = data.operatingHours[today];
  return <div className="container-page py-8 sm:py-12">
    <VendorGallery photos={data.photos} name={data.name}/>
    <div className="relative mx-auto -mt-10 grid max-w-6xl gap-8 lg:grid-cols-[1fr_350px]"><div className="space-y-8"><section className="card relative p-6 sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row"><div><div className="mb-3 flex flex-wrap items-center gap-2">{data.isVerified && <span className="chip !bg-emerald-50 !text-emerald-700"><BadgeCheck size={16}/>{common("verified")}</span>}<span className={`chip ${open ? "!bg-emerald-50 !text-emerald-700" : ""}`}><Clock3 size={15}/>{open ? common("openNow") : common("closed")}</span></div><h1 className="text-3xl font-black sm:text-5xl">{data.name}</h1><p className="mt-3 flex items-center gap-2 text-stone-600"><MapPin size={18}/>{data.address}, {data.area}</p></div><div className="flex h-fit items-center gap-2 rounded-2xl bg-amber-50 p-4"><Star className="fill-amber-400 text-amber-400"/><strong className="text-2xl">{data.ratingAvg.toFixed(1)}</strong><span className="text-sm text-stone-500">({data.ratingCount})</span></div></div><p className="mt-6 max-w-3xl leading-7 text-stone-600">{data.description}</p><div className="mt-6 flex flex-wrap gap-2">{data.specialties.map((item) => <span className="chip" key={item}>{item}</span>)}</div><div className="mt-7 flex flex-wrap gap-3"><button onClick={onMyWay} className="btn-primary"><Navigation size={18}/>{t("onMyWay")}</button>{data.phone && <a className="btn-secondary" href={`tel:${data.phone}`}><Phone size={18}/>{t("call")}</a>}<a target="_blank" rel="noreferrer" className="btn-secondary" href={`https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lng}`}><MapPin size={18}/>{t("directions")}</a><button onClick={share} className="btn-secondary"><Share2 size={18}/>{t("share")}</button>{user && <Link className="btn-secondary" href={`/vendor/${id}/edit`}><Edit3 size={18}/>{t("edit")}</Link>}</div>{(coming.data?.count || 0) > 0 && <p className="mt-4 rounded-2xl bg-emerald-50 p-3 font-bold text-emerald-800">🔥 {coming.data?.count} {t("coming")}</p>}</section>
      <section><div className="mb-5 flex items-end justify-between"><div><h2 className="text-3xl font-black">{t("communityReviews")}</h2><p className="mt-1 text-stone-500">{data.ratingCount} {common("reviews")}</p></div></div><div className="space-y-4">{data.reviews?.map((review: Review) => <article key={review.id} className="card p-6"><div className="flex justify-between gap-4"><div><p className="font-black">{review.user.name || "Dhaka Foodie"}</p><p className="mt-1 text-xs text-stone-500">{new Date(review.createdAt).toLocaleDateString()}</p></div><span className="flex h-fit items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-bold"><Star size={15} className="fill-amber-400 text-amber-400"/>{review.rating}</span></div><p className="mt-4 leading-7 text-stone-700">{review.comment}</p><div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-500"><span>{t("taste")} <b>{review.tasteRating}/5</b></span><span>{t("hygiene")} <b>{review.hygieneRating}/5</b></span><span>{t("value")} <b>{review.valueRating}/5</b></span></div></article>)}</div></section>
    </div><aside className="space-y-5"><div className="card p-6"><h3 className="font-black">{t("today")}</h3><p className="mt-2 text-lg">{schedule?.closed ? common("closed") : `${schedule?.open || "—"} — ${schedule?.close || "—"}`}</p><p className="mt-4 text-sm text-stone-500">{data.address}</p></div>{user ? <><ReviewForm vendorId={id} onSuccess={() => vendor.refetch()}/><div className="card p-6"><h3 className="mb-4 font-black">{t("addPhoto")}</h3><PhotoUploader onUploaded={addPhoto} label={t("addPhoto")}/></div></> : <Link href="/auth/login" className="card block p-6 text-center font-bold text-saffron-700">{t("loginPrompt")}</Link>}<button onClick={() => user ? api(`/api/vendors/${id}/report`, { method: "POST", body: JSON.stringify({ reason: "Incorrect information" }) }).then(() => toast.success("Report received")) : location.assign("/auth/login")} className="flex w-full items-center justify-center gap-2 text-sm text-stone-500"><Flag size={15}/>{t("report")}</button></aside></div>
  </div>;
}
