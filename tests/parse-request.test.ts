import { describe, expect, it } from "vitest";
import { parseRequest } from "../src/lib/validation/parse-request";
import { taskCreateSchema } from "../src/lib/validations/task.schema";

describe("parseRequest", () => {
  it("returns a structured validation error for invalid input", () => {
    const result = parseRequest(taskCreateSchema, { title: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(result.error.message).toBe("Request validation failed");
      expect(result.error.details.length).toBeGreaterThan(0);
    }
  });

  it("accepts the revised task contract", () => {
    const result = parseRequest(taskCreateSchema, {
      title: "Ship the API",
      projectId: "proj-demo",
      status: "review",
      dueDate: "2026-06-30",
    });

    expect(result.success).toBe(true);
  });
});
