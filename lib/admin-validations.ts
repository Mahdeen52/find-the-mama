import { z } from "zod";

export const verificationSchema = z.object({ level: z.number().int().min(0).max(3), notes: z.string().trim().max(1000).optional() });
export const reasonSchema = z.object({ reason: z.string().trim().min(3).max(500) });
export const mergeSchema = z.object({ targetVendorId: z.string().min(1) });
export const reviewModerationSchema = z.object({ action: z.enum(["hide", "show", "spam", "unspam", "delete"]), reason: z.string().trim().max(500).optional() });
export const photoModerationSchema = z.object({ action: z.enum(["hide", "show", "inappropriate", "appropriate", "delete"]), reason: z.string().trim().max(500).optional() });
export const trustSchema = z.object({ delta: z.number().int().min(-1000).max(1000).optional(), trustScore: z.number().int().min(-10000).max(100000).optional(), isTrustedContributor: z.boolean().optional(), reason: z.string().trim().min(3).max(500) }).refine((v) => v.delta !== undefined || v.trustScore !== undefined || v.isTrustedContributor !== undefined, "Provide a trust change");
export const roleSchema = z.object({ role: z.enum(["USER", "MODERATOR", "ADMIN"]), reason: z.string().trim().min(3).max(500).optional() });
export const statusSchema = z.object({ status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]), reason: z.string().trim().min(3).max(500) });
export const resolveReportSchema = z.object({ status: z.enum(["RESOLVED", "DISMISSED"]), resolutionType: z.string().trim().min(2).max(80), note: z.string().trim().max(1000).optional(), assignedToId: z.string().optional() });
export const settingsSchema = z.object({ trustScoreThresholdForTrusted: z.number().int().min(0), pointsReviewWithPhoto: z.number().int(), pointsReviewWithoutPhoto: z.number().int(), pointsVendorLevel1: z.number().int(), penaltySpam: z.number().int().max(0), penaltyFakeVendor: z.number().int().max(0), trustedReviewWeight: z.number().positive(), regularReviewWeight: z.number().positive(), autoLevel1MinTrustedPhotoReviews: z.number().int().min(1) });
