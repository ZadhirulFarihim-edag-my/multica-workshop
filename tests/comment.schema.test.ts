import { describe, expect, it } from "vitest";
import { commentCreateSchema } from "../src/lib/validations/comment.schema";

describe("comment validation schema", () => {
  it("rejects an empty comment body", () => {
    const result = commentCreateSchema.safeParse({
      content: " ",
      taskId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });
});
