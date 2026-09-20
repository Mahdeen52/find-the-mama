import { NextResponse } from "next/server";

export const ok = <T>(data: T, status = 200) => NextResponse.json({ success: true, data }, { status });
export const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

export function handleApiError(error: unknown) {
  console.error(error);
  if (error instanceof Error && error.message === "UNAUTHORIZED") return fail("Authentication required", 401);
  if (error instanceof Error && error.message === "FORBIDDEN") return fail("You do not have permission to do that", 403);
  return fail(error instanceof Error ? error.message : "Unexpected server error", 500);
}
