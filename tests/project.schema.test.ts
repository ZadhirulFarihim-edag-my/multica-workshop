import { describe, expect, it } from "vitest";
import { projectCreateSchema, projectUpdateSchema } from "../src/lib/validations/project.schema";

describe("project validation schemas", () => {
  it("accepts a project create payload with owner and status", () => {
    const result = projectCreateSchema.safeParse({
      name: "Command Center",
      ownerId: "member-demo",
      status: "active",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty project update payload", () => {
    const result = projectUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
