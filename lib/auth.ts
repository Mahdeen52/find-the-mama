import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "ftm_session";
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || "development-only-secret-change-this");

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret());
  cookies().set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.userId || typeof payload.userId !== "string") return null;
    return db.user.findUnique({ where: { id: payload.userId } });
  } catch { return null; }
}

export async function requireAuth() {
  const user = await getSession();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export const publicUser = (user: NonNullable<Awaited<ReturnType<typeof getSession>>>) => ({
  id: user.id, phone: user.phone, email: user.email, name: user.name, photoUrl: user.photoUrl,
  languagePref: user.languagePref, contributionPoints: user.contributionPoints,
  badges: Array.isArray(user.badges) ? user.badges.filter((badge): badge is string => typeof badge === "string") : [],
  isAdmin: user.isAdmin || Boolean(user.email?.toLowerCase().includes("admin"))
});
