"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, LocateFixed, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useAuth } from "@/components/auth-provider";
import { DynamicVendorMap } from "@/components/map-dynamic";
import { PhotoUploader } from "@/components/photo-uploader";
import { SectionHeader } from "@/components/ui";
import { VendorPhoto } from "@/components/vendor-photo";
import { api } from "@/lib/api";
import { AREA_CENTERS, AREAS, DEFAULT_HOURS, PRICE_RANGES, SPECIALTIES } from "@/lib/constants";
import { POINT_RULES } from "@/lib/gamification";
import type { Vendor } from "@/lib/types";
import { vendorSchema } from "@/lib/validations";

type Values = z.infer<typeof vendorSchema>;

const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const steps = [
  { key: "basic", hint: "stepHint1", fields: ["name", "description"] },
  { key: "location", hint: "stepHint2", fields: ["address", "area", "zone", "lat", "lng"] },
  { key: "hours", hint: "stepHint3", fields: ["operatingHours", "phone"] },
  { key: "flavours", hint: "stepHint4", fields: ["specialties", "priceRange", "photoUrls"] },
  { key: "review", hint: "stepHint5", fields: [] }
] satisfies Array<{ key: string; hint: string; fields: (keyof Values)[] }>;

export function VendorForm({ vendor }: { vendor?: Vendor }) {
  const t = useTranslations("Form");
  const common = useTranslations("Common");
  const vendorText = useTranslations("Vendor");
  const format = useFormatter();
  const router = useRouter();
  const client = useQueryClient();
  const { refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [uploading, setUploading] = useState(false);
  const formTop = useRef<HTMLHeadingElement>(null);
  const form = useForm<Values>({
    resolver: zodResolver(vendorSchema),
    defaultValues: vendor ? {
      name: vendor.name, description: vendor.description, address: vendor.address,
      area: vendor.area as Values["area"], zone: vendor.zone as Values["zone"], lat: vendor.lat, lng: vendor.lng,
      phone: vendor.phone || "", specialties: vendor.specialties, operatingHours: vendor.operatingHours,
      priceRange: vendor.priceRange, photoUrls: vendor.photos.map((photo) => photo.photoUrl)
    } : {
      name: "", description: "", address: "", area: "Dhanmondi", zone: "Dhanmondi",
      lat: AREA_CENTERS.Dhanmondi[0], lng: AREA_CENTERS.Dhanmondi[1], phone: "", specialties: ["Dahi Fuchka"],
      operatingHours: DEFAULT_HOURS, priceRange: "BUDGET", photoUrls: []
    }
  });
  const values = form.watch();
  const { errors, isSubmitting } = form.formState;
  const last = step === steps.length - 1;

  function goTo(target: number) {
    setStep(target);
    setStepError("");
    requestAnimationFrame(() => formTop.current?.focus());
  }

  async function next() {
    if (await form.trigger(steps[step].fields, { shouldFocus: true })) goTo(step + 1);
    else setStepError(t("fixErrors"));
  }

  function setPosition(lat: number, lng: number) {
    form.setValue("lat", lat, { shouldValidate: true });
    form.setValue("lng", lng, { shouldValidate: true });
  }

  function useLocation() {
    if (!navigator.geolocation) { toast.error(t("locationUnavailable")); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setPosition(coords.latitude, coords.longitude);
      toast.success(t("locationAdded"));
    }, () => toast.error(t("locationUnavailable")), { enableHighAccuracy: true, timeout: 10_000 });
  }

  const submit = form.handleSubmit(async (data) => {
    setStepError("");
    try {
      const result = await api<Vendor>(vendor ? `/api/vendors/${vendor.id}` : "/api/vendors", {
        method: vendor ? "PUT" : "POST", body: JSON.stringify(data)
      });
      void refresh();
      void client.invalidateQueries({ queryKey: ["vendor", result.id] });
      void client.invalidateQueries({ queryKey: ["vendors"] });
      void client.invalidateQueries({ queryKey: ["search"] });
      toast.success(vendor ? t("success") : t("successPoints"));
      router.push(`/vendor/${result.id}`);
    } catch (error) {
      setStepError(error instanceof Error ? error.message : common("error"));
    }
  }, () => setStepError(t("fixErrors")));

  const errorProps = (field: keyof Values) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field]?.message ? `listing-${field}-error` : undefined
  });

  function fieldError(field: keyof Values) {
    const message = errors[field]?.message;
    return typeof message === "string" && <span id={`listing-${field}-error`} className="field-error">{message}</span>;
  }

  return (
    <div className="page-section">
      <div className="mx-auto max-w-3xl">
        <SectionHeader page title={t(vendor ? "editTitle" : "addTitle")} description={t("subtitle")}
          action={!vendor && <span className="chip chip-brand">+{common("points", { count: POINT_RULES.add_vendor })}</span>}
        />
        <ol className="mb-6 mt-6 grid grid-cols-5 gap-2" aria-label={t("stepOf", { current: step + 1, total: steps.length })}>
          {steps.map((item, index) => (
            <li key={item.key}>
              <button
                type="button" disabled={index > step || uploading || isSubmitting} onClick={() => index < step && goTo(index)} aria-current={index === step ? "step" : undefined}
                aria-label={t(item.key)} className={`flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold ${index === step ? "border-brand-100 bg-brand-50 text-brand-700" : "border-line bg-white text-muted enabled:hover:border-brand-100"}`}
              >
                {index < step ? <Check size={17} aria-hidden="true" /> : <span aria-hidden="true">{format.number(index + 1)}</span>}
                <span className="hidden sm:inline">{t(item.key)}</span>
              </button>
            </li>
          ))}
        </ol>
        <form noValidate className="card" onSubmit={(event) => {
          if (last) void submit(event);
          else { event.preventDefault(); if (!uploading) void next(); }
        }} aria-busy={isSubmitting}>
          <div className="border-b border-line px-4 py-4 sm:px-6">
            <p className="text-xs font-semibold text-muted">{t("stepOf", { current: step + 1, total: steps.length })}</p>
            <h2 tabIndex={-1} ref={formTop} className="card-title mt-1">{t(steps[step].key)}</h2>
            <p className="mt-1 text-sm text-muted">{t(vendor && last ? "editNote" : steps[step].hint)}</p>
          </div>
          <div className="p-4 sm:p-6">
            {stepError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{stepError}</p>}

            {step === 0 && <div className="space-y-4">
              <label className="block"><span className="label">{t("name")}</span><input className="field" {...errorProps("name")} {...form.register("name")} />{fieldError("name")}</label>
              <label className="block"><span className="label">{t("description")}</span><textarea rows={5} className="field" {...errorProps("description")} {...form.register("description")} />{fieldError("description")}</label>
            </div>}

            {step === 1 && <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">{t("mapHint")}</p>
                <button type="button" className="btn-secondary" onClick={useLocation}><LocateFixed size={17} aria-hidden="true" />{t("useLocation")}</button>
              </div>
              <DynamicVendorMap picker className="h-64 sm:h-80" position={Number.isFinite(values.lat) && Number.isFinite(values.lng) && Math.abs(values.lat) <= 90 && Math.abs(values.lng) <= 180 ? [values.lat, values.lng] : undefined} onPositionChange={setPosition} />
              <label className="block"><span className="label">{t("address")}</span><input className="field" {...errorProps("address")} {...form.register("address")} />{fieldError("address")}</label>
              <label className="block"><span className="label">{t("area")}</span>
                <select className="field" {...form.register("area")} onChange={(event) => {
                  const selected = event.target.value as Values["area"];
                  form.setValue("area", selected);
                  form.setValue("zone", selected);
                  if (!vendor) setPosition(...AREA_CENTERS[selected]);
                }}>{AREAS.map((area) => <option key={area}>{area}</option>)}</select>
              </label>
              <fieldset className="grid grid-cols-2 gap-3">
                <legend className="sr-only">{t("coordinates")}</legend>
                <label><span className="label">{t("latitude")}</span><input className="field" type="number" step="any" {...errorProps("lat")} {...form.register("lat", { valueAsNumber: true })} />{fieldError("lat")}</label>
                <label><span className="label">{t("longitude")}</span><input className="field" type="number" step="any" {...errorProps("lng")} {...form.register("lng", { valueAsNumber: true })} />{fieldError("lng")}</label>
              </fieldset>
            </div>}

            {step === 2 && <div className="space-y-4">
              {days.map((day, index) => {
                const weekday = format.dateTime(new Date(Date.UTC(2024, 0, 7 + index)), { weekday: "long", timeZone: "UTC" });
                const closed = values.operatingHours[day]?.closed;
                return (
                  <fieldset key={day} className="rounded-lg border border-line p-3">
                    <legend className="px-1 text-sm font-semibold">{weekday}</legend>
                    <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <label><span className="label">{t("opens")}</span><input type="time" readOnly={closed} className="field px-2 read-only:bg-surface" {...form.register(`operatingHours.${day}.open`)} /></label>
                      <label><span className="label">{t("closes")}</span><input type="time" readOnly={closed} className="field px-2 read-only:bg-surface" {...form.register(`operatingHours.${day}.close`)} /></label>
                      <label className="col-span-2 flex min-h-11 items-center gap-2 text-sm font-semibold sm:col-auto sm:px-2"><input type="checkbox" className="h-4 w-4" {...form.register(`operatingHours.${day}.closed`)} />{t("closed")}</label>
                    </div>
                  </fieldset>
                );
              })}
              <label className="block"><span className="label">{t("phone")}</span><input type="tel" className="field" {...form.register("phone")} /></label>
            </div>}

            {step === 3 && <div className="space-y-6">
              <fieldset {...errorProps("specialties")}>
                <legend className="label">{vendorText("specialties")}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SPECIALTIES.map((item) => (
                    <label key={item} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-sm has-[:checked]:border-brand-100 has-[:checked]:bg-brand-50">
                      <input type="checkbox" className="h-4 w-4" checked={values.specialties.includes(item)} onChange={() => form.setValue("specialties", values.specialties.includes(item) ? values.specialties.filter((value) => value !== item) : [...values.specialties, item], { shouldValidate: true })} />{item}
                    </label>
                  ))}
                </div>
                {fieldError("specialties")}
              </fieldset>
              <label className="block"><span className="label">{t("price")}</span><select className="field" {...form.register("priceRange")}>{PRICE_RANGES.map((item) => <option key={item} value={item}>{common(item.toLowerCase() as "budget" | "moderate" | "premium")}</option>)}</select></label>
              <div>
                <h3 className="label">{t("photos")} ({format.number(values.photoUrls.length)}/5)</h3>
                <p className="mb-3 text-sm text-muted">{t("photoHint")}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {values.photoUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative aspect-[16/10] overflow-hidden rounded-lg bg-surface">
                      <VendorPhoto src={url} alt={vendorText("photo", { current: index + 1, total: values.photoUrls.length })} sizes="220px" />
                      <button type="button" className="btn-secondary absolute right-2 top-2 h-11 w-11 px-0" aria-label={t("removePhoto", { count: index + 1 })} onClick={() => form.setValue("photoUrls", form.getValues("photoUrls").filter((_, position) => position !== index))}><X size={18} aria-hidden="true" /></button>
                    </div>
                  ))}
                  {values.photoUrls.length < 5 && <PhotoUploader label={t("upload")} onBusyChange={setUploading} onUploaded={(url) => {
                    form.setValue("photoUrls", [...form.getValues("photoUrls"), url]);
                    toast.success(vendorText("photoReady"));
                  }} />}
                </div>
                {fieldError("photoUrls")}
              </div>
            </div>}

            {last && <div>
              <section className="rounded-lg border border-line bg-canvas p-4">
                <h3 className="card-title break-words">{values.name}</h3>
                <p className="mt-1 break-words text-sm text-muted">{values.address}, {values.area}</p>
                <p className="mt-3 whitespace-pre-line break-words text-sm">{values.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-muted">{t("price")}</dt><dd className="font-semibold">{common(values.priceRange.toLowerCase() as "budget" | "moderate" | "premium")}</dd></div>
                  <div><dt className="text-muted">{t("photos")}</dt><dd className="font-semibold">{t("attached", { count: values.photoUrls.length })}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">{values.specialties.map((item) => <span className="chip" key={item}>{item}</span>)}</div>
              </section>
              {!vendor && <p className="mt-4 text-sm text-muted">{t("publishNote")}</p>}
            </div>}
          </div>
          <div className="flex flex-wrap justify-between gap-3 border-t border-line px-4 py-4 sm:px-6">
            <button type="button" className="btn-secondary" disabled={step === 0 || uploading || isSubmitting} onClick={() => goTo(step - 1)}><ChevronLeft size={17} aria-hidden="true" />{common("back")}</button>
            <button type="submit" className="btn-primary" disabled={uploading || isSubmitting}>
              {last ? t(isSubmitting ? "saving" : vendor ? "update" : "publish") : common("next")}
              {last ? <Check size={16} aria-hidden="true" /> : <ChevronRight size={17} aria-hidden="true" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
