"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type AdminDialogField = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

export function AdminDialog({ open, title, description, fields = [], confirmLabel = "Confirm", danger = false, onClose, onSubmit }: {
  open: boolean;
  title: string;
  description?: string;
  fields?: AdminDialogField[];
  confirmLabel?: string;
  danger?: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setValues(Object.fromEntries(fields.map((field) => [field.name, field.defaultValue || ""])));
  }, [open, title]);

  if (!open) return null;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/55 p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && !busy) onClose(); }}>
    <form className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" onSubmit={async (event) => { event.preventDefault(); setBusy(true); try { await onSubmit(values); onClose(); } finally { setBusy(false); } }}>
      <div className="flex items-start justify-between gap-4"><div><h2 id="admin-dialog-title" className="text-2xl font-black">{title}</h2>{description && <p className="mt-2 text-sm text-stone-600">{description}</p>}</div><button type="button" aria-label="Close" className="rounded-full p-2 hover:bg-stone-100" onClick={onClose} disabled={busy}><X size={20}/></button></div>
      {fields.length > 0 && <div className="mt-6 space-y-4">{fields.map((field) => <label key={field.name}><span className="label">{field.label}</span>{field.type === "select" ? <select className="field" required={field.required} value={values[field.name] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}>{field.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select> : field.type === "textarea" ? <textarea className="field min-h-28" required={field.required} placeholder={field.placeholder} value={values[field.name] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}/> : <input className="field" type={field.type || "text"} required={field.required} placeholder={field.placeholder} value={values[field.name] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}/>}</label>)}</div>}
      <div className="mt-6 flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button><button type="submit" disabled={busy} className={danger ? "inline-flex min-h-11 items-center justify-center rounded-full bg-red-600 px-5 font-bold text-white disabled:opacity-50" : "btn-primary"}>{busy ? "Working…" : confirmLabel}</button></div>
    </form>
  </div>;
}
