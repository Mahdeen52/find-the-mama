import { createSession, publicUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, handleApiError, ok } from "@/lib/http";
import { otpVerifySchema } from "@/lib/validations";
import { normalizeBdPhone } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    const parsed = otpVerifySchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid OTP", 422);
    if (parsed.data.otp !== "1234") return fail("Incorrect OTP. Use 1234 for the demo.", 401);
    const phone = normalizeBdPhone(parsed.data.phone);
    const email = parsed.data.email?.trim().toLowerCase() || "";
    const existingByEmail = email ? await db.user.findUnique({ where: { email } }) : null;
    const user = existingByEmail || await db.user.upsert({ where: { phone }, create: { phone, email: email || null, name: `Foodie ${phone.slice(-4)}`, isVerified: true }, update: { email: email || undefined, isVerified: true } });
    await createSession(user.id);
    return ok(publicUser(user));
  } catch (error) { return handleApiError(error); }
}
