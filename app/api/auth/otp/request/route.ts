import { otpRequestSchema } from "@/lib/validations";
import { fail, ok } from "@/lib/http";
import { normalizeBdPhone } from "@/lib/phone";

export async function POST(request: Request) {
  const parsed = otpRequestSchema.safeParse(await request.json());
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid phone", 422);
  console.info(`[mock-otp] Sent OTP 1234 to ${normalizeBdPhone(parsed.data.phone)}`);
  return ok({ sent: true, expiresInSeconds: 300, mockOtp: "1234" });
}
