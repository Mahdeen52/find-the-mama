import { NextRequest, NextResponse } from "next/server";
const SESSION_COOKIE = "ftm_session";

export function middleware(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/vendor/add", "/vendor/:id/edit", "/admin/:path*", "/api/admin/:path*"] };
