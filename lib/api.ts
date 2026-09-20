import type { ApiResponse } from "@/lib/types";

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: options?.body instanceof FormData ? options.headers : { "Content-Type": "application/json", ...options?.headers } });
  const json = await response.json() as ApiResponse<T>;
  if (!response.ok || !json.success) throw new Error("error" in json ? json.error : "Something went wrong");
  return json.data;
}
