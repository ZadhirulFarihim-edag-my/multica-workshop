import { describe, expect, it } from "vitest";
import { activityLogListQuerySchema, projectListQuerySchema, taskListQuerySchema } from "../src/lib/validations/query.schema";

describe("query validation schemas", () => {
  it("parses pagination for project lists", () => {
    const result = projectListQuerySchema.safeParse({
      page: "2",
      pageSize: "5",
      search: "command",
      status: "active",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.pageSize).toBe(5);
    }
  });

  it("parses task list filters", () => {
    const result = taskListQuerySchema.safeParse({
      page: "1",
      pageSize: "10",
      status: "review",
      projectId: "proj-demo",
      dueBefore: "2026-06-30",
    });

    expect(result.success).toBe(true);
  });

  it("parses activity log filters", () => {
    const result = activityLogListQuerySchema.safeParse({
      page: "1",
      pageSize: "10",
      actorId: "member-demo",
    });

    expect(result.success).toBe(true);
  });
});
