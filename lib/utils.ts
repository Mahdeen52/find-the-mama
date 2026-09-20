import { clsx, type ClassValue } from "clsx";
import type { Hours } from "@/lib/types";

export function cn(...inputs: ClassValue[]) { return clsx(inputs); }

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (v: number) => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isOpenNow(hours: Hours, now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dhaka", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now).map((part) => [part.type, part.value]));
  const day = parts.weekday.toLowerCase();
  const schedule = hours?.[day];
  if (!schedule || schedule.closed) return false;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const parse = (time: string) => Number(time.split(":")[0]) * 60 + Number(time.split(":")[1]);
  const start = parse(schedule.open);
  const end = parse(schedule.close);
  return end < start ? minutes >= start || minutes <= end : minutes >= start && minutes <= end;
}

export function firstZodError(error: { issues?: { message: string }[] }) {
  return error.issues?.[0]?.message ?? "Invalid request";
}
