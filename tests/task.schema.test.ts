import { describe, expect, it } from "vitest";
import { taskCreateSchema, taskUpdateSchema } from "../src/lib/validations/task.schema";

describe("task validation schemas", () => {
  it("rejects an empty task title on create", () => {
    const result = taskCreateSchema.safeParse({ title: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts review as a task status and a date-only due date", () => {
    const result = taskCreateSchema.safeParse({
      title: "Refine task contract",
      projectId: "proj-demo",
      status: "review",
      dueDate: "2026-06-30",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty task update payload", () => {
    const result = taskUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
