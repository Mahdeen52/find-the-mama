"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle } from "lucide-react";
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
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<LoginData>({
    resolver: zodResolver(verifying ? otpVerifySchema : otpRequestSchema),
    defaultValues: { phone: "+8801", email: "", otp: "" }
  });
  const { errors, isSubmitting } = form.formState;

  const submit = form.handleSubmit(async (data) => {
    setError("");
    try {
      if (!verifying) {
        await api("/api/auth/otp/request", { method: "POST", body: JSON.stringify({ phone: data.phone, email: data.email }) });
        setVerifying(true);
        return;
      }
      const user = await api<User>("/api/auth/otp/verify", { method: "POST", body: JSON.stringify(data) });
      setUser(user);
      toast.success(t("welcome"));
      const requested = new URLSearchParams(window.location.search).get("next");
      const safeRequested = requested?.startsWith("/") && !/^[/][\\/]/.test(requested) ? requested : null;
      router.replace(safeRequested || (user.role === "ADMIN" || user.role === "MODERATOR" ? "/admin" : "/"));
    } catch (cause) {
      setError(cause instanceof Error && cause.message.startsWith("Incorrect OTP") ? t("incorrectCode") : t("authError"));
    }
  });

  return (
    <div className="container-page grid place-items-center py-12 sm:min-h-[68vh] sm:py-16">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center text-sm text-muted"><strong className="text-ink">Find The Mama</strong> — {t("brandLine")}</p>
        <form noValidate onSubmit={submit} className="card p-6 sm:p-8" aria-busy={isSubmitting}>
          <h1 className="page-title">{t(verifying ? "verifyTitle" : "title")}</h1>
          <p className="mt-2 text-sm text-muted">
            {verifying ? t("verifyDescription", { phone: form.getValues("phone") }) : t("subtitle")}
          </p>

          <div className="mt-6 space-y-4">
            {verifying ? (
              <>
                <div>
                  <label htmlFor="otp" className="label">{t("otp")}</label>
                  <input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={4} autoFocus className="field text-xl tracking-[.35em]" aria-invalid={Boolean(errors.otp)} aria-describedby={errors.otp ? "otp-error otp-hint" : "otp-hint"} {...form.register("otp")} />
                  {errors.otp && <p id="otp-error" className="field-error" role="alert">{t("invalidCode")}</p>}
                  <p id="otp-hint" className="mt-2 text-sm text-muted">{t("hint")}</p>
                </div>
                <button type="button" className="btn-ghost -ml-3" disabled={isSubmitting} onClick={() => { form.resetField("otp"); setError(""); setVerifying(false); }}>
                  <ArrowLeft size={16} aria-hidden="true" />{t("changeNumber")}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="phone" className="label">{t("phone")}</label>
                  <input id="phone" type="tel" autoComplete="tel" className="field" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} {...form.register("phone")} />
                  {errors.phone && <p id="phone-error" className="field-error" role="alert">{t("invalidPhone")}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="label">{t("email")}</label>
                  <input id="email" type="email" autoComplete="email" className="field" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} {...form.register("email")} />
                  {errors.email && <p id="email-error" className="field-error" role="alert">{t("invalidEmail")}</p>}
                </div>
              </>
            )}
            {error && <p className="field-error rounded-lg bg-red-50 p-3" role="alert">{error}</p>}
            <button disabled={isSubmitting} className="btn-primary w-full" type="submit">
              {isSubmitting && <LoaderCircle size={17} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
              {t(verifying ? (isSubmitting ? "verifying" : "verify") : (isSubmitting ? "sending" : "send"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
