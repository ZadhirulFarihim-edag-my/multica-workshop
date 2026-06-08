export type TeamMemberStatus = "active" | "inactive" | "invited";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: TeamMemberStatus;
  avatarUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTaskCount: number;
}

export interface PageInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TeamMemberListData {
  items: TeamMember[];
  pageInfo: PageInfo;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
