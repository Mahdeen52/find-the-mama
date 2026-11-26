"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Clock3, Edit3, Flag, MapPin, Navigation, Phone, Share2, UserRound } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth-provider";
import { Dialog } from "@/components/dialog";
import { PhotoUploader } from "@/components/photo-uploader";
import { ReviewForm } from "@/components/review-form";
import { Rating, SectionHeader, Skeleton, StatePanel } from "@/components/ui";
import { VendorGallery } from "@/components/vendor-gallery";
import { VendorPhoto } from "@/components/vendor-photo";
import { api, ApiError } from "@/lib/api";
import type { Vendor } from "@/lib/types";
import { isOpenNow, listingRating } from "@/lib/utils";

export default function VendorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("Vendor");
  const common = useTranslations("Common");
  const format = useFormatter();
  const { user, refresh } = useAuth();
  const client = useQueryClient();
  const [reportOpen, setReportOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const vendor = useQuery({ queryKey: ["vendor", id], queryFn: () => api<Vendor>(`/api/vendors/${id}`) });
  const coming = useQuery({
    queryKey: ["on-my-way", id], queryFn: () => api<{ count: number }>(`/api/vendors/${id}/on-my-way`),
    enabled: Boolean(vendor.data), refetchInterval: 10_000
  });
  const loginHref = `/auth/login?next=${encodeURIComponent(`/vendor/${id}`)}`;

  if (vendor.isPending) return <div className="page-section"><Skeleton className="h-80" label={common("loading")} /></div>;
  if (!vendor.data) {
    const missing = vendor.error instanceof ApiError && vendor.error.status === 404;
    return <div className="page-section"><StatePanel
      title={missing ? t("notFound") : common("errorTitle")} description={missing ? common("description") : common("error")} error={!missing}
      action={missing ? <Link href="/search" className="btn-primary">{common("search")}</Link> : <button className="btn-primary" onClick={() => void vendor.refetch()}>{common("retry")}</button>}
    /></div>;
  }

  const data = vendor.data;
  const open = isOpenNow(data.operatingHours);
  const rating = listingRating(data);
  const today = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Dhaka" }).format(new Date()).toLowerCase();
  const schedule = data.operatingHours?.[today];

  async function onMyWay() {
    if (!user) { router.push(loginHref); return; }
    setNotifying(true);
    try {
      const result = await api<{ count: number }>(`/api/vendors/${id}/on-my-way`, { method: "POST" });
      client.setQueryData(["on-my-way", id], result);
      toast.success(t("notified"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : common("error"));
    } finally {
      setNotifying(false);
    }
  }

  async function addPhoto(url: string) {
    await api(`/api/vendors/${id}/photos`, { method: "POST", body: JSON.stringify({ photoUrl: url }) });
    toast.success(t("photoAdded"));
    void vendor.refetch();
    void refresh();
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: data.name, url: location.href });
      } else {
        await navigator.clipboard.writeText(location.href);
        toast.success(t("copied"));
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) toast.error(common("error"));
    }
  }

  return (
    <div className="page-section">
      <Link href="/search" className="btn-ghost -ml-3"><ArrowLeft size={17} aria-hidden="true" />{common("search")}</Link>
      <div className="mt-2">
        <SectionHeader page title={data.name} action={<button type="button" className="btn-secondary" onClick={share}><Share2 size={17} aria-hidden="true" />{t("share")}</button>} />
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><MapPin size={16} className="shrink-0" aria-hidden="true" />{data.address}, {data.area}</span>
          <span className="inline-flex items-center gap-2">
            {data.ratingCount > 0 ? <><Rating value={rating} label={common("rating", { value: rating.toFixed(1) })} />{format.number(data.ratingCount)} {common("reviews")}</> : common("unrated")}
          </span>
          {data.isVerified && <span className="chip chip-brand"><BadgeCheck size={15} aria-hidden="true" />{common("verified")}</span>}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="min-w-0 space-y-6">
          <VendorGallery photos={data.photos} name={data.name} />
          <section className="card p-4 sm:p-6">
            <p className="whitespace-pre-line break-words leading-relaxed">{data.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">{data.specialties.map((item) => <span className="chip" key={item}>{item}</span>)}</div>
          </section>
          <section>
            <h2 className="section-title mb-4">{t("communityReviews")}</h2>
            {!data.reviews?.length && <StatePanel title={t("noReviews")} description={t("firstReview")} action={user ? <a href="#write-review" className="btn-secondary">{t("addReview")}</a> : undefined} />}
            <div className="space-y-3">
              {data.reviews?.map((review) => (
                <article key={review.id} className="card p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-muted"><UserRound size={19} aria-hidden="true" /></span>
                      <div>
                        <h3 className="break-words font-semibold">{review.user.name || t("anonymous")}</h3>
                        <time className="text-xs text-muted" dateTime={review.createdAt}>{format.dateTime(new Date(review.createdAt), { dateStyle: "medium" })}</time>
                      </div>
                    </div>
                    <Rating value={review.rating} label={common("rating", { value: review.rating })} />
                  </div>
                  <p className="mt-3 whitespace-pre-line break-words leading-relaxed">{review.comment}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["taste", "hygiene", "value"] as const).map((metric) => <span key={metric} className="chip">{t(metric)} {review[`${metric}Rating`]}/5</span>)}
                  </div>
                  {review.photos?.length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">
                    {review.photos.map((url, index) => <div className="relative aspect-square overflow-hidden rounded-lg" key={`${url}-${index}`}><VendorPhoto src={url} alt={t("photo", { current: index + 1, total: review.photos.length })} sizes="25vw" /></div>)}
                  </div>}
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <section className="card p-4 sm:p-6">
            <h2 className="card-title">{t("today")}</h2>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Clock3 size={16} className="text-muted" aria-hidden="true" />
              {schedule?.closed ? common("closed") : schedule?.open && schedule.close ? `${schedule.open} – ${schedule.close}` : t("unavailable")}
              {open && <span className="chip"><span className="h-2 w-2 rounded-full bg-emerald-700" />{common("openNow")}</span>}
            </p>
            <p className="mt-2 text-sm text-muted">{data.priceRange && common(data.priceRange.toLowerCase() as "budget" | "moderate" | "premium")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={onMyWay} className="btn-primary" disabled={notifying}><Navigation size={17} aria-hidden="true" />{notifying ? common("loading") : t("onMyWay")}</button>
              <a target="_blank" rel="noreferrer" className="btn-secondary" href={`https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lng}`}><MapPin size={17} aria-hidden="true" />{t("directions")}</a>
              {data.phone && <a className="btn-secondary" href={`tel:${data.phone}`}><Phone size={17} aria-hidden="true" />{t("call")}</a>}
            </div>
            {!!coming.data?.count && <p role="status" className="mt-3 text-sm font-semibold text-brand-700">{format.number(coming.data.count)} {t("coming")}</p>}
          </section>
          {user ? (
            <>
              <div id="write-review"><ReviewForm vendorId={id} onSuccess={() => void vendor.refetch()} /></div>
              <section className="card p-4 sm:p-6">
                <h2 className="card-title mb-3">{t("photos")}</h2>
                <PhotoUploader onUploaded={addPhoto} label={t("addPhoto")} />
              </section>
            </>
          ) : (
            <div className="card p-4 sm:p-6">
              <p className="text-sm text-muted">{t("loginPrompt")}</p>
              <Link href={loginHref} className="btn-secondary mt-3">{common("login")}</Link>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {user && <Link href={`/vendor/${id}/edit`} className="btn-ghost"><Edit3 size={16} aria-hidden="true" />{t("edit")}</Link>}
            <button type="button" onClick={() => user ? setReportOpen(true) : router.push(loginHref)} className="btn-ghost"><Flag size={16} aria-hidden="true" />{t("report")}</button>
          </div>
        </aside>
      </div>
      <Dialog open={reportOpen} title={t("reportTitle")} description={t("reportDescription")} confirmLabel={t("report")} onClose={() => setReportOpen(false)}
        onSubmit={async () => {
          await api(`/api/vendors/${id}/report`, { method: "POST", body: JSON.stringify({ reason: "Incorrect information" }) });
          toast.success(t("reportReceived"));
        }}
      />
    </div>
  );
}
