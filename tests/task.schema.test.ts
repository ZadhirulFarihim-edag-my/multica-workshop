import { describe, expect, it } from "vitest";
import { taskCreateSchema, taskUpdateSchema } from "../src/lib/validations/task.schema";

describe("task validation schemas", () => {
  it("rejects an empty task title on create", () => {
    const result = taskCreateSchema.safeParse({ title: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects an empty task update payload", () => {
    const result = taskUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
