import { describe, expect, it } from "vitest";
import { commentCreateSchema } from "../src/lib/validations/comment.schema";

describe("comment validation schema", () => {
  it("rejects an empty comment body", () => {
    const result = commentCreateSchema.safeParse({
      content: " ",
      taskId: "task-demo",
    });
    expect(result.success).toBe(false);
  });
});
