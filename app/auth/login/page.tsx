"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, Phone, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { otpRequestSchema, otpVerifySchema } from "@/lib/validations";

type LoginData = z.infer<typeof otpVerifySchema>;
export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { setUser } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const form = useForm<LoginData>({ resolver: zodResolver(step === "phone" ? otpRequestSchema : otpVerifySchema), defaultValues: { phone: "+8801", email: "", otp: "" } });
  const submit = form.handleSubmit(async (data) => {
    if (step === "phone") {
      try {
        await api("/api/auth/otp/request", { method: "POST", body: JSON.stringify({ phone: data.phone, email: data.email }) });
        setStep("otp"); toast.success(t("sent"));
      } catch (error) { toast.error(error instanceof Error ? error.message : "Login failed"); }
      return;
    }
    try {
      const user = await api<User>("/api/auth/otp/verify", { method: "POST", body: JSON.stringify(data) });
      setUser(user);
      toast.success(t("welcome"));
      const requested = new URLSearchParams(window.location.search).get("next");
      const safeRequested = requested?.startsWith("/") && !requested.startsWith("//") ? requested : null;
      router.replace(safeRequested || (user.role === "ADMIN" || user.role === "MODERATOR" ? "/admin" : "/"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      return;
    }
  });
  return <div className="container-page grid min-h-[72vh] place-items-center py-12"><div className="grid w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-orange-100 bg-white shadow-warm md:grid-cols-[.9fr_1.1fr]"><div className="hidden bg-ink p-10 text-white md:block"><div className="inline-flex rounded-full bg-white/10 p-3"><Sparkles/></div><h2 className="mt-8 text-4xl font-black">ঢাকার সেরা ফুচকা, সবার জন্য।</h2><p className="mt-5 leading-7 text-stone-300">Your contribution can turn a roadside cart into the neighbourhood's next favourite.</p><div className="mt-14 space-y-3 text-sm"><p>✓ Add and update trusted listings</p><p>✓ Share flavour and hygiene ratings</p><p>✓ Support local street-food makers</p></div></div><form onSubmit={submit} className="p-7 sm:p-12"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-saffron-700">{step === "phone" ? <Phone/> : <KeyRound/>}</div><h1 className="mt-6 text-3xl font-black">{t("title")}</h1><p className="mt-3 text-stone-600">{t("subtitle")}</p><div className="mt-8 space-y-5">{step === "phone" ? <><label><span className="label">{t("phone")}</span><input className="field" {...form.register("phone")}/><span className="mt-1 block text-sm text-red-600">{form.formState.errors.phone?.message}</span></label><label><span className="label">{t("email")}</span><input type="email" className="field" {...form.register("email")}/></label></> : <><button type="button" onClick={() => setStep("phone")} className="flex items-center gap-2 text-sm font-bold text-saffron-700"><ArrowLeft size={16}/>{form.getValues("phone")}</button><label><span className="label">{t("otp")}</span><input inputMode="numeric" maxLength={4} autoFocus className="field text-center text-2xl tracking-[.5em]" {...form.register("otp")}/><span className="mt-1 block text-sm text-red-600">{form.formState.errors.otp?.message}</span></label><p className="rounded-2xl bg-orange-50 p-3 text-sm text-orange-800">{t("hint")}</p></>}<button disabled={form.formState.isSubmitting} className="btn-primary w-full">{step === "phone" ? t("send") : t("verify")}</button></div></form></div></div>;
}
