"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ImagePlus, LocateFixed, MapPin, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useAuth } from "@/components/auth-provider";
import { DynamicVendorMap } from "@/components/map-dynamic";
import { PhotoUploader } from "@/components/photo-uploader";
import { api } from "@/lib/api";
import { AREA_CENTERS, AREAS, DEFAULT_HOURS, PRICE_RANGES, SPECIALTIES } from "@/lib/constants";
import type { Vendor } from "@/lib/types";
import { vendorSchema } from "@/lib/validations";

type Values = z.infer<typeof vendorSchema>;
const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const stepFields: (keyof Values)[][] = [
  ["name", "description"],
  ["address", "area", "zone", "lat", "lng"],
  ["operatingHours", "phone"],
  ["specialties", "priceRange", "photoUrls"],
  []
];

export function VendorForm({ vendor }: { vendor?: Vendor }) {
  const t = useTranslations("Form");
  const common = useTranslations("Common");
  const router = useRouter();
  const { refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const formTop = useRef<HTMLDivElement>(null);
  const form = useForm<Values>({
    resolver: zodResolver(vendorSchema),
    mode: "onSubmit",
    defaultValues: vendor ? {
      name: vendor.name, description: vendor.description, address: vendor.address,
      area: vendor.area as Values["area"], zone: vendor.zone as Values["zone"], lat: vendor.lat, lng: vendor.lng,
      phone: vendor.phone || "", specialties: vendor.specialties, operatingHours: vendor.operatingHours,
      priceRange: vendor.priceRange, photoUrls: vendor.photos.map((photo) => photo.photoUrl)
    } : {
      name: "", description: "", address: "", area: "Dhanmondi", zone: "Dhanmondi",
      lat: 23.7465, lng: 90.376, phone: "", specialties: ["Dahi Fuchka"],
      operatingHours: DEFAULT_HOURS, priceRange: "BUDGET", photoUrls: []
    }
  });
  const values = form.watch();
  const steps = [
    { name: t("basic"), icon: Store }, { name: t("location"), icon: MapPin },
    { name: t("hours"), icon: Clock3 }, { name: t("flavours"), icon: ImagePlus },
    { name: t("review"), icon: CheckCircle2 }
  ];

  const goTo = (target: number) => {
    setStep(target); setStepError("");
    requestAnimationFrame(() => formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const next = async () => {
    const valid = await form.trigger(stepFields[step], { shouldFocus: true });
    if (!valid) { setStepError(t("fixErrors")); toast.error(t("fixErrors")); return; }
    goTo(Math.min(4, step + 1));
  };
  const useLocation = () => {
    if (!navigator.geolocation) { toast.error(t("locationUnavailable")); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      form.setValue("lat", coords.latitude, { shouldValidate: true });
      form.setValue("lng", coords.longitude, { shouldValidate: true });
      toast.success(t("locationAdded"));
    }, () => toast.error(t("locationUnavailable")), { enableHighAccuracy: true, timeout: 10_000 });
  };
  const submit = form.handleSubmit(async (data) => {
    try {
      const result = await api<Vendor>(vendor ? `/api/vendors/${vendor.id}` : "/api/vendors", { method: vendor ? "PUT" : "POST", body: JSON.stringify(data) });
      await refresh();
      toast.success(vendor ? t("success") : t("successPoints"));
      router.push(`/vendor/${result.id}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : common("error")); }
  }, () => { setStepError(t("fixErrors")); toast.error(t("fixErrors")); });

  return <div className="container-page py-10 sm:py-14"><div className="mx-auto max-w-5xl" ref={formTop}>
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-saffron-700">+20 community points</div><h1 className="text-4xl font-black sm:text-5xl">{vendor ? t("editTitle") : t("addTitle")}</h1><p className="mt-3 text-stone-600">{t("subtitle")}</p></div><p className="text-sm font-bold text-stone-500">{t("stepOf", { current: step + 1, total: steps.length })}</p></div>
    <ol className="mb-7 grid grid-cols-5 gap-2" aria-label="Listing progress">{steps.map((item, index) => <li key={item.name}><button type="button" disabled={index > step} onClick={() => index < step && goTo(index)} className={`w-full rounded-2xl p-3 text-center text-xs font-bold transition sm:text-sm ${index === step ? "bg-saffron-600 text-white shadow-sm" : index < step ? "bg-ink text-white" : "bg-white text-stone-400"}`} aria-current={index === step ? "step" : undefined}><item.icon className="mx-auto mb-1" size={19}/><span className="hidden sm:inline">{item.name}</span></button></li>)}</ol>
    <form onSubmit={submit} noValidate className="card overflow-hidden">
      <div className="border-b border-orange-100 bg-orange-50/70 px-6 py-4 sm:px-9"><h2 className="text-xl font-black">{steps[step].name}</h2><p className="mt-1 text-sm text-stone-500">{t(`stepHint${step + 1}`)}</p></div>
      <div className="p-6 sm:p-9">
        {stepError && <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">{stepError}</div>}
        {step === 0 && <div className="space-y-5"><label><span className="label">{t("name")}</span><input className="field" {...form.register("name")}/><p className="mt-1 text-sm text-red-600">{form.formState.errors.name?.message}</p></label><label><span className="label">{t("description")}</span><textarea rows={6} className="field" {...form.register("description")}/><p className="mt-1 text-sm text-red-600">{form.formState.errors.description?.message}</p></label></div>}
        {step === 1 && <div className="space-y-5"><div className="flex items-center justify-between gap-3"><div><span className="label">{t("location")}</span><p className="text-sm text-stone-500">{t("mapHint")}</p></div><button type="button" onClick={useLocation} className="btn-secondary !px-4"><LocateFixed size={18}/><span className="hidden sm:inline">{t("useLocation")}</span></button></div><DynamicVendorMap picker position={[values.lat, values.lng]} onPositionChange={(lat, lng) => { form.setValue("lat", lat, { shouldValidate: true }); form.setValue("lng", lng, { shouldValidate: true }); }}/><label><span className="label">{t("address")}</span><input className="field" {...form.register("address")}/><p className="mt-1 text-sm text-red-600">{form.formState.errors.address?.message}</p></label><div className="grid gap-4 sm:grid-cols-2"><label><span className="label">{t("area")}</span><select className="field" {...form.register("area")} onChange={(event) => { const selected = event.target.value as Values["area"]; form.setValue("area", selected); form.setValue("zone", selected); if (!vendor) { const center = AREA_CENTERS[selected]; form.setValue("lat", center[0]); form.setValue("lng", center[1]); } }}>{AREAS.map((area) => <option key={area}>{area}</option>)}</select></label><div><span className="label">Coordinates</span><div className="field text-sm text-stone-500">{values.lat.toFixed(5)}, {values.lng.toFixed(5)}</div></div></div></div>}
        {step === 2 && <div className="space-y-5"><div className="space-y-3">{days.map((day) => { const closed = values.operatingHours[day]?.closed; return <div key={day} className="grid gap-3 rounded-2xl bg-orange-50 p-3 sm:grid-cols-[70px_1fr_1fr_auto] sm:items-center"><strong className="capitalize">{day}</strong><input aria-label={`${day} opening time`} type="time" readOnly={closed} className="field !min-h-10 !p-2 read-only:opacity-40" {...form.register(`operatingHours.${day}.open`)}/><input aria-label={`${day} closing time`} type="time" readOnly={closed} className="field !min-h-10 !p-2 read-only:opacity-40" {...form.register(`operatingHours.${day}.close`)}/><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" className="accent-orange-600" {...form.register(`operatingHours.${day}.closed`)}/>{t("closed")}</label></div>; })}</div><label><span className="label">{t("phone")}</span><input className="field" {...form.register("phone")}/></label></div>}
        {step === 3 && <div className="space-y-7"><div><span className="label">{t("flavours")}</span><div className="grid gap-3 sm:grid-cols-2">{SPECIALTIES.map((item) => <label key={item} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${values.specialties.includes(item) ? "border-orange-400 bg-orange-50" : "border-orange-100 hover:border-orange-300"}`}><input type="checkbox" checked={values.specialties.includes(item)} onChange={() => form.setValue("specialties", values.specialties.includes(item) ? values.specialties.filter((value) => value !== item) : [...values.specialties, item], { shouldValidate: true })} className="accent-orange-600"/>{item}</label>)}</div><p className="mt-1 text-sm text-red-600">{form.formState.errors.specialties?.message}</p></div><label><span className="label">{t("price")}</span><select className="field" {...form.register("priceRange")}>{PRICE_RANGES.map((item, index) => <option key={item} value={item}>{"৳".repeat(index + 1)} · {item}</option>)}</select></label><div><span className="label">{t("photos")} ({values.photoUrls.length}/5)</span><p className="mb-3 text-sm text-stone-500">{t("photoHint")}</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{values.photoUrls.map((url, index) => <button aria-label="Remove photo" type="button" onClick={() => form.setValue("photoUrls", values.photoUrls.filter((_, itemIndex) => itemIndex !== index))} key={`${url}-${index}`} className="group relative aspect-video overflow-hidden rounded-2xl bg-orange-100"><img src={url} alt="Upload preview" className="h-full w-full object-cover"/><span className="absolute inset-x-2 bottom-2 rounded-full bg-ink/80 px-2 py-1 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">Remove</span></button>)}{values.photoUrls.length < 5 && <PhotoUploader onUploaded={(url) => form.setValue("photoUrls", [...values.photoUrls, url])} label={t("upload")}/>}</div></div></div>}
        {step === 4 && <div><div className="rounded-3xl border border-orange-100 bg-orange-50/50 p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-saffron-700">{t("ready")}</p><h3 className="mt-1 text-2xl font-black">{values.name}</h3><p className="mt-1 text-stone-600">{values.address}, {values.area}</p></div><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-leaf text-white"><Check size={24}/></div></div><dl className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white p-4"><dt className="text-xs font-bold uppercase tracking-wider text-stone-500">{t("price")}</dt><dd className="mt-1 font-black">{values.priceRange}</dd></div><div className="rounded-2xl bg-white p-4"><dt className="text-xs font-bold uppercase tracking-wider text-stone-500">{t("photos")}</dt><dd className="mt-1 font-black">{values.photoUrls.length} attached</dd></div><div className="rounded-2xl bg-white p-4 sm:col-span-2"><dt className="text-xs font-bold uppercase tracking-wider text-stone-500">{t("flavours")}</dt><dd className="mt-2 flex flex-wrap gap-2">{values.specialties.map((item) => <span className="chip" key={item}>{item}</span>)}</dd></div></dl></div><p className="mt-5 text-sm text-stone-500">{t("publishNote")}</p></div>}
      </div>
      <div className="flex justify-between border-t border-orange-100 bg-stone-50/60 px-6 py-5 sm:px-9"><button type="button" onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0} className="btn-secondary"><ChevronLeft size={18}/>{common("back")}</button>{step < 4 ? <button type="button" onClick={next} className="btn-primary">{common("next")}<ChevronRight size={18}/></button> : <button type="submit" disabled={form.formState.isSubmitting} className="btn-primary"><Check size={18}/>{vendor ? t("update") : t("publish")}</button>}</div>
    </form>
  </div></div>;
}
