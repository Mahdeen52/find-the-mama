"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "@/lib/api";
import { reviewSchema } from "@/lib/validations";

type Values = z.infer<typeof reviewSchema>;
function RatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) { return <div className="flex gap-1">{[1,2,3,4,5].map((star) => <button aria-label={`${star} stars`} type="button" key={star} onClick={() => onChange(star)}><Star size={26} className={star <= value ? "fill-amber-400 text-amber-400" : "text-stone-300"}/></button>)}</div>; }

export function ReviewForm({ vendorId, onSuccess }: { vendorId: string; onSuccess: () => void }) {
  const t = useTranslations("Vendor");
  const form = useForm<Values>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 5, tasteRating: 5, hygieneRating: 4, valueRating: 5, comment: "", photos: [] } });
  const submit = form.handleSubmit(async (values) => { try { await api(`/api/vendors/${vendorId}/reviews`, { method: "POST", body: JSON.stringify(values) }); toast.success("Review published"); form.reset(); onSuccess(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not publish review"); } });
  return <form onSubmit={submit} className="card p-6"><h3 className="text-xl font-black">{t("addReview")}</h3><div className="mt-4"><RatingInput value={form.watch("rating")} onChange={(v) => form.setValue("rating", v)}/></div><div className="mt-5 grid grid-cols-3 gap-3">{(["tasteRating", "hygieneRating", "valueRating"] as const).map((field) => <label key={field}><span className="label">{t(field.replace("Rating", "") as "taste" | "hygiene" | "value")}</span><select {...form.register(field, { valueAsNumber: true })} className="field !py-2">{[5,4,3,2,1].map((n) => <option key={n}>{n}</option>)}</select></label>)}</div><textarea rows={4} className="field mt-4" placeholder={t("comment")} {...form.register("comment")}/><p className="mt-1 text-sm text-red-600">{form.formState.errors.comment?.message}</p><button disabled={form.formState.isSubmitting} className="btn-primary mt-4 w-full">{t("submitReview")}</button></form>;
}
