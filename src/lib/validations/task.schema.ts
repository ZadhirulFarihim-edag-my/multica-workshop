import { z } from "zod";
import {
  entityIdSchema,
  isoDateTimeOrDateSchema,
  optionalTrimmedString,
  trimmedString,
  updateObjectSchema,
} from "./shared";

export const taskStatusSchema = z.enum(["todo", "in_progress", "review", "blocked", "done"]);

export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

const taskFields = {
  title: trimmedString("Task title is required"),
  description: optionalTrimmedString(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  projectId: entityIdSchema,
  assigneeId: entityIdSchema.optional(),
  dueDate: isoDateTimeOrDateSchema.optional(),
};

export const taskCreateSchema = z.object({
  title: taskFields.title,
  description: taskFields.description,
  status: taskFields.status.default("todo"),
  priority: taskFields.priority.default("medium"),
  projectId: taskFields.projectId,
  assigneeId: taskFields.assigneeId,
  dueDate: taskFields.dueDate,
});

export const taskUpdateSchema = updateObjectSchema(
  {
    title: taskFields.title,
    description: taskFields.description,
    status: taskFields.status,
    priority: taskFields.priority,
    projectId: taskFields.projectId,
    assigneeId: taskFields.assigneeId,
    dueDate: taskFields.dueDate,
  },
  "At least one task field must be provided"
);

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
