import type { DashboardSnapshot } from "./dashboard-view-model";

type DashboardApiResponse = {
  success: boolean;
  data?: DashboardSnapshot;
  error?: {
    message?: string;
  };
};

export async function fetchDashboardSummary(): Promise<DashboardSnapshot> {
  const response = await fetch("/api/dashboard/summary", {
    headers: {
      Accept: "application/json",
    },
  });

  const body = (await response.json()) as DashboardApiResponse;

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Unable to load dashboard");
  }

  return body.data;
}
