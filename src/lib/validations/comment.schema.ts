import { z } from "zod";
import { entityIdSchema, trimmedString, updateObjectSchema } from "./shared.js";

export const commentCreateSchema = z.object({
  content: trimmedString("Comment content is required"),
  taskId: entityIdSchema,
  parentCommentId: entityIdSchema.optional(),
  authorId: entityIdSchema.optional(),
});

export const commentUpdateSchema = updateObjectSchema(
  {
    content: trimmedString("Comment content is required"),
  },
  "At least one comment field must be provided"
);

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;
