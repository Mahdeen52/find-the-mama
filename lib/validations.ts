import { z } from "zod";
import { AREAS, PRICE_RANGES } from "@/lib/constants";

export const phoneSchema = z.string().regex(/^(?:\+?88)?01[3-9]\d{8}$/, "Use a valid Bangladeshi phone number");
export const otpRequestSchema = z.object({ phone: phoneSchema, email: z.string().email().optional().or(z.literal("")) });
export const otpVerifySchema = otpRequestSchema.extend({ otp: z.string().regex(/^\d{4}$/, "OTP must be 4 digits") });

const dayHours = z.object({ open: z.string(), close: z.string(), closed: z.boolean().optional() });
export const vendorSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(1000),
  address: z.string().trim().min(5).max(250),
  area: z.enum(AREAS),
  zone: z.enum(AREAS),
  lat: z.coerce.number().min(23.6).max(23.95),
  lng: z.coerce.number().min(90.25).max(90.6),
  phone: z.string().optional().nullable(),
  specialties: z.array(z.string()).min(1),
  operatingHours: z.record(dayHours),
  priceRange: z.enum(PRICE_RANGES),
  photoUrls: z.array(z.string()).max(5).default([])
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(1000),
  hygieneRating: z.coerce.number().int().min(1).max(5),
  tasteRating: z.coerce.number().int().min(1).max(5),
  valueRating: z.coerce.number().int().min(1).max(5),
  photos: z.array(z.string()).max(3).default([])
});

export const photoSchema = z.object({ photoUrl: z.string().min(1), caption: z.string().max(160).optional() });
export const reportSchema = z.object({ reason: z.string().min(2).max(80), description: z.string().max(500).optional() });
