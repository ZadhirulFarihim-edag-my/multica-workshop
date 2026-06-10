"use client";

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: {
    message?: string;
  };
};

export async function readApiEnvelope<T>(response: Response) {
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !body?.success || body.data === undefined) {
    throw new Error(body?.error?.message ?? "Request failed");
  }

  return body.data;
}
