import type {
  ApiResponse,
  TeamMemberListData,
} from "./types";

const DEFAULT_PAGE_SIZE = 8;

export async function loadTeamMembers(
  page: number,
  signal?: AbortSignal,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<TeamMemberListData> {
  const searchParams = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const response = await fetch(`/api/team-members?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  const payload = (await response.json()) as ApiResponse<TeamMemberListData>;

  if (!response.ok || !payload.success) {
    const message =
      payload.success === false
        ? payload.error.message
        : "Failed to load team members";
    throw new Error(message);
  }

  return payload.data;
}

export { DEFAULT_PAGE_SIZE };
