export type PageInfo = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ActivityLogItem = {
  id: string;
  projectId: string;
  taskId: string | null;
  actorId: string | null;
  action: string;
  summary: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
    status: "planning" | "active" | "archived";
    color: string | null;
  };
  task: {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "review" | "blocked" | "done";
    priority: "low" | "medium" | "high" | "urgent";
  } | null;
  actor: {
    id: string;
    name: string;
    email: string;
    role: "owner" | "admin" | "member" | "viewer";
    status: "active" | "inactive" | "invited";
    avatarUrl: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type ActivityLogPage = {
  items: ActivityLogItem[];
  pageInfo: PageInfo;
};

type ActivityLogApiResponse = {
  success: boolean;
  data?: ActivityLogPage;
  error?: {
    message?: string;
  };
};

export async function fetchActivityLogPage(input: {
  baseUrl: string;
  page: number;
  pageSize: number;
  projectId?: string;
  taskId?: string;
  actorId?: string;
  action?: string;
}) {
  const params = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  });

  if (input.projectId) {
    params.set("projectId", input.projectId);
  }

  if (input.taskId) {
    params.set("taskId", input.taskId);
  }

  if (input.actorId) {
    params.set("actorId", input.actorId);
  }

  if (input.action) {
    params.set("action", input.action);
  }

  const response = await fetch(`${input.baseUrl}/api/activity-logs?${params.toString()}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const body = (await response.json()) as ActivityLogApiResponse;

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Unable to load activity feed");
  }

  return body.data;
}
