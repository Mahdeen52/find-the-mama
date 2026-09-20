import { getSession, publicUser, requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, handleApiError, ok } from "@/lib/http";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() { const user = await getSession(); return ok(user ? publicUser(user) : null); }
export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const parsed = z.object({ name: z.string().min(2).max(80).optional(), email: z.string().email().optional(), photoUrl: z.string().url().optional(), languagePref: z.enum(["bn", "en"]).optional() }).safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid profile", 422);
    const updated = await db.user.update({ where: { id: user.id }, data: parsed.data });
    return ok(publicUser(updated));
  } catch (error) { return handleApiError(error); }
}
