"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "@/lib/api";
import { reviewSchema } from "@/lib/validations";
import { useAuth } from "@/components/auth-provider";

type Values = z.infer<typeof reviewSchema>;

export function ReviewForm({ vendorId, onSuccess }: { vendorId: string; onSuccess: () => void }) {
  const t = useTranslations("Vendor");
  const common = useTranslations("Common");
  const { refresh } = useAuth();
  const form = useForm<Values>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, tasteRating: 5, hygieneRating: 4, valueRating: 5, comment: "", photos: [] }
  });
  const rating = form.watch("rating");
  const { errors, isSubmitting } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    try {
      await api(`/api/vendors/${vendorId}/reviews`, { method: "POST", body: JSON.stringify(values) });
      toast.success(t("published"));
      form.reset();
      onSuccess();
      void refresh();
    } catch (error) {
      form.setError("root", { message: error instanceof Error ? error.message : common("error") });
    }
  });

  return (
    <form onSubmit={submit} className="card space-y-4 p-4 sm:p-6" aria-busy={isSubmitting}>
      <h2 className="card-title">{t("addReview")}</h2>
      <fieldset>
        <legend className="label">{t("overall")}</legend>
        <div className="flex flex-wrap gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-lg hover:bg-brand-50">
              <input type="radio" value={star} className="peer sr-only" {...form.register("rating", { valueAsNumber: true })} />
              <span className="absolute inset-0 rounded-lg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-brand-600" />
              <span className="sr-only">{common("rating", { value: star })}</span>
              <Star size={23} aria-hidden="true" className={star <= rating ? "fill-brand-600 text-brand-600" : "text-muted"} />
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-3 gap-2">
        {([["tasteRating", "taste"], ["hygieneRating", "hygiene"], ["valueRating", "value"]] as const).map(([field, label]) => (
          <label key={field}>
            <span className="label break-words">{t(label)}</span>
            <select {...form.register(field, { valueAsNumber: true })} className="field px-2">{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select>
          </label>
        ))}
      </div>
      <div>
        <label htmlFor="review-comment" className="label">{t("reviewLabel")}</label>
        <textarea id="review-comment" rows={4} className="field" placeholder={t("comment")} aria-invalid={Boolean(errors.comment)} aria-describedby={errors.comment ? "review-error" : undefined} {...form.register("comment")} />
        {errors.comment && <p id="review-error" role="alert" className="field-error">{errors.comment.message}</p>}
      </div>
      {errors.root?.message && <p role="alert" className="field-error">{errors.root.message}</p>}
      <button disabled={isSubmitting} className="btn-primary w-full" type="submit">{t(isSubmitting ? "publishing" : "submitReview")}</button>
    </form>
  );
}
