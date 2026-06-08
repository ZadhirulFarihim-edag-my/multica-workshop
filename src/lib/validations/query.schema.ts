import { z } from "zod";
import {
  entityIdSchema,
  isoDateTimeOrDateSchema,
} from "./shared.js";

const pageSchema = z.coerce.number().int().min(1).default(1);

const pageSizeSchema = z.coerce.number().int().min(1).max(100).default(10);

export const paginationQuerySchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export const projectListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  status: z.enum(["planning", "active", "archived"]).optional(),
  ownerId: entityIdSchema.optional(),
});

export const taskListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  status: z.enum(["todo", "in_progress", "review", "blocked", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  projectId: entityIdSchema.optional(),
  assigneeId: entityIdSchema.optional(),
  dueBefore: isoDateTimeOrDateSchema.optional(),
  dueAfter: isoDateTimeOrDateSchema.optional(),
});

export const teamMemberListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  status: z.enum(["active", "inactive", "invited"]).optional(),
  role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
});

export const commentListQuerySchema = paginationQuerySchema.extend({
  taskId: entityIdSchema.optional(),
  authorId: entityIdSchema.optional(),
  parentCommentId: entityIdSchema.optional(),
});

export const activityLogListQuerySchema = paginationQuerySchema.extend({
  projectId: entityIdSchema.optional(),
  taskId: entityIdSchema.optional(),
  actorId: entityIdSchema.optional(),
  action: z.string().trim().min(1).optional(),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
export type ProjectListQueryInput = z.infer<typeof projectListQuerySchema>;
export type TaskListQueryInput = z.infer<typeof taskListQuerySchema>;
export type TeamMemberListQueryInput = z.infer<typeof teamMemberListQuerySchema>;
export type CommentListQueryInput = z.infer<typeof commentListQuerySchema>;
export type ActivityLogListQueryInput = z.infer<typeof activityLogListQuerySchema>;
