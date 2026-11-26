"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ActionButton } from "@/components/admin/action-button";
import { AdminResults } from "@/components/admin/admin-results";
import { SectionHeader } from "@/components/ui";
import { api } from "@/lib/api";

type Settings = {
  trustScoreThresholdForTrusted: number;
  pointsReviewWithPhoto: number;
  pointsReviewWithoutPhoto: number;
  pointsVendorLevel1: number;
  penaltySpam: number;
  penaltyFakeVendor: number;
  trustedReviewWeight: number;
  regularReviewWeight: number;
  autoLevel1MinTrustedPhotoReviews: number;
};

const labels: Record<keyof Settings, string> = {
  trustScoreThresholdForTrusted: "Trusted contributor threshold",
  pointsReviewWithPhoto: "Points for an approved review with a photo",
  pointsReviewWithoutPhoto: "Points for an approved review without a photo",
  pointsVendorLevel1: "Points when a submitted vendor reaches L1",
  penaltySpam: "Spam review penalty",
  penaltyFakeVendor: "Fake vendor penalty",
  trustedReviewWeight: "Trusted review weight",
  regularReviewWeight: "Standard review weight",
  autoLevel1MinTrustedPhotoReviews: "Trusted photo reviews needed for L1",
};

export default function SettingsPage() {
  const query = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api<Settings>("/api/admin/settings"),
  });
  const [form, setForm] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  async function save() {
    if (!form || saving) return;
    setSaving(true);
    setError("");
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      toast.success("Settings saved");
      void query.refetch();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionHeader
        page
        title="Trust settings"
        description="Configure trust scoring, weighted ratings, and automatic verification."
      />
      <AdminResults query={query}>
        {form && (
          <form
            noValidate
            className="card mt-6 p-4 sm:p-6"
            aria-busy={saving}
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {(Object.keys(labels) as (keyof Settings)[]).map((key) => (
                <label key={key}>
                  <span className="label">{labels[key]}</span>
                  <input
                    className="field"
                    type="number"
                    step={key.includes("Weight") ? "0.1" : "1"}
                    value={form[key]}
                    onChange={(event) =>
                      setForm({ ...form, [key]: Number(event.target.value) })
                    }
                  />
                </label>
              ))}
            </div>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary mt-4"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save settings"}
            </button>
          </form>
        )}
      </AdminResults>
      <section className="card mt-6 p-4 sm:p-6">
        <h2 className="card-title">Maintenance jobs</h2>
        <p className="mt-1 text-sm text-muted">
          These jobs use the current rules and write to the audit log.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton
            url="/api/admin/settings/recalc-trust"
            label="Recalculate all trust scores"
            confirmText="Recalculate every user's trust score?"
          />
          <ActionButton
            url="/api/admin/settings/auto-level1"
            label="Run level 1 verification"
          />
          <ActionButton
            url="/api/admin/settings/recompute-weighted-ratings"
            label="Recompute all ratings"
          />
        </div>
      </section>
    </div>
  );
}
