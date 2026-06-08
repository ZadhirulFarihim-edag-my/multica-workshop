import { z } from "zod";
import { optionalTrimmedString, trimmedString, uuidSchema } from "./shared";

export const commentCreateSchema = z.object({
  content: trimmedString("Comment content is required"),
  taskId: uuidSchema,
  parentCommentId: uuidSchema.optional(),
  authorId: uuidSchema.optional(),
  authorName: optionalTrimmedString(),
});

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
