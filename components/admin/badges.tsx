import { clsx } from "clsx";

const levelNames = [
  "L0 Unverified",
  "L1 Community",
  "L2 Moderator",
  "L3 Claimed",
];

export function VerificationBadge({ level }: { level: number }) {
  return (
    <span className={clsx("chip", level >= 2 && "chip-brand")}>
      {levelNames[level] || `L${level}`}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const color = ["ACTIVE", "RESOLVED"].includes(value)
    ? "bg-emerald-700"
    : ["OPEN", "PENDING", "REVIEWING"].includes(value)
      ? "bg-amber-700"
      : ["BANNED", "REJECTED", "SUSPENDED"].includes(value)
        ? "bg-red-700"
        : "bg-stone-500";
  return (
    <span className="chip">
      <span className={`h-2 w-2 rounded-full ${color}`} aria-hidden="true" />
      <span className="capitalize">{value.toLowerCase()}</span>
    </span>
  );
}

export function TrustBadge({
  trusted,
  score,
}: {
  trusted: boolean;
  score: number;
}) {
  return (
    <span className={clsx("chip", trusted && "chip-brand")}>
      {trusted ? "Trusted" : "Standard"} · {score}
    </span>
  );
}
