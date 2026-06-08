import { describe, expect, it } from "vitest";
import { projectCreateSchema, projectUpdateSchema } from "../src/lib/validations/project.schema";

describe("project validation schemas", () => {
  it("rejects an empty project name on create", () => {
    const result = projectCreateSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty project update payload", () => {
    const result = projectUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
