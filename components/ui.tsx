import { AlertCircle, ImageOff, MapPin, Star } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeader({ title, description, action, page = false }: {
  title: string; description?: string; action?: ReactNode; page?: boolean;
}) {
  const Heading = page ? "h1" : "h2";
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Heading className={page ? "page-title" : "section-title"}>{title}</Heading>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatePanel({ title, description, action, error = false, page = false }: {
  title: string; description?: string; action?: ReactNode; error?: boolean; page?: boolean;
}) {
  const Icon = error ? AlertCircle : MapPin;
  const Heading = page ? "h1" : "h2";
  return (
    <div className="card grid justify-items-center px-6 py-12 text-center" role={error ? "alert" : undefined}>
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-700"><Icon size={22} aria-hidden="true" /></span>
      <Heading className={page ? "page-title" : "card-title"}>{title}</Heading>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className, label }: { className: string; label?: string }) {
  return <div className={`skeleton ${className}`} role={label ? "status" : undefined}>{label && <span className="sr-only">{label}</span>}</div>;
}

export function Rating({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold tabular-nums" aria-label={label} role="img">
      <Star aria-hidden="true" size={16} className="fill-brand-600 text-brand-600" />
      {value.toFixed(1)}
    </span>
  );
}

export function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="grid h-full place-content-center justify-items-center gap-2 bg-surface px-4 text-center text-sm text-muted">
      <ImageOff size={24} aria-hidden="true" />{label}
    </div>
  );
}
