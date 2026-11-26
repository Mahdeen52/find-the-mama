"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function Dialog({ open, title, description, confirmLabel, danger = false, onClose, onSubmit, children }: {
  open: boolean; title: string; description?: string; confirmLabel: string; danger?: boolean;
  onClose: () => void; onSubmit: () => Promise<void>; children?: ReactNode;
}) {
  const t = useTranslations("Common");
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const node = dialog.current;
    if (open && node && !node.open) {
      setError("");
      node.showModal();
    } else if (!open && node?.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialog} aria-labelledby={id} aria-describedby={description ? `${id}-description` : undefined}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-0 text-ink shadow-raised backdrop:bg-ink/50"
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
      onClick={(event) => { if (event.currentTarget === event.target && !busy) onClose(); }}
    >
      <form className="p-5 sm:p-6" aria-busy={busy} onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
          await onSubmit();
          onClose();
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : t("error"));
        } finally {
          setBusy(false);
        }
      }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={id} className="card-title">{title}</h2>
            {description && <p id={`${id}-description`} className="mt-2 text-sm text-muted">{description}</p>}
          </div>
          <button type="button" className="btn-icon -mr-2 -mt-2" aria-label={t("close")} onClick={onClose} disabled={busy} autoFocus><X size={19} aria-hidden="true" /></button>
        </div>
        {children}
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>{t("cancel")}</button>
          <button type="submit" className={danger ? "btn-danger" : "btn-primary"} disabled={busy}>{busy ? t("loading") : confirmLabel}</button>
        </div>
      </form>
    </dialog>
  );
}
