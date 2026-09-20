import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  cookies().set(SESSION_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return NextResponse.redirect(new URL("/", request.url), 303);
}
