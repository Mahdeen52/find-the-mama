"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { AdminDialog } from "@/components/admin/admin-dialog";
import { api } from "@/lib/api";

export function ActionButton({ url, body, label, confirmText, onDone, className = "btn-secondary !min-h-9 !px-3 !py-1.5 text-sm" }: { url: string; body?: unknown; label: string; confirmText?: string; onDone?: () => void; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      const result = await api<{ count?: number }>(url, { method: "POST", body: JSON.stringify(body || {}) });
      toast.success(result.count !== undefined ? `${label}: ${result.count} updated` : `${label} complete`);
      onDone?.();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Action failed"); throw error; }
    finally { setBusy(false); }
  };
  return <><button disabled={busy} className={className} onClick={() => confirmText ? setConfirming(true) : void run().catch(() => undefined)}>{busy ? "Working…" : label}</button><AdminDialog open={confirming} title={label} description={confirmText} confirmLabel={label} onClose={() => setConfirming(false)} onSubmit={run}/></>;
}
