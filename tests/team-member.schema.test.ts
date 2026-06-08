import { describe, expect, it } from "vitest";
import {
  teamMemberCreateSchema,
  teamMemberRoleSchema,
  teamMemberUpdateSchema,
} from "../src/lib/validations/team-member.schema";

describe("team member validation schema", () => {
  it("accepts free-form role names", () => {
    expect(teamMemberRoleSchema.parse("Backend Engineer")).toBe("Backend Engineer");
  });

  it("defaults new members to active status", () => {
    const result = teamMemberCreateSchema.parse({
      name: "Alex Morgan",
      email: "alex@example.com",
      role: "Backend Engineer",
    });

    expect(result.status).toBe("active");
  });

  it("rejects an empty team member update payload", () => {
    const result = teamMemberUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
