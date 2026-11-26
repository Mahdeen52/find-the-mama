import type { ApiResponse } from "@/lib/types";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: options?.body instanceof FormData ? options.headers : { "Content-Type": "application/json", ...options?.headers } });
  const json = await response.json() as ApiResponse<T>;
  if (!response.ok || !json.success) throw new ApiError("error" in json ? json.error : "Something went wrong", response.status);
  return json.data;
}
