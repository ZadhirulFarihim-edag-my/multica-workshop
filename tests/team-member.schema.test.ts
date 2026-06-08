import { describe, expect, it } from "vitest";
import {
  teamMemberCreateSchema,
  teamMemberRoleSchema,
  teamMemberUpdateSchema,
} from "../src/lib/validations/team-member.schema.js";

describe("team member validation schema", () => {
  it("accepts a team member create payload", () => {
    const result = teamMemberCreateSchema.safeParse({
      name: "Demo Member",
      email: "demo@example.com",
      role: teamMemberRoleSchema.Enum.member,
    });

    expect(result.success).toBe(true);
  });

  it("defaults new members to active status", () => {
    const result = teamMemberCreateSchema.parse({
      name: "Demo Member",
      email: "demo@example.com",
      role: teamMemberRoleSchema.Enum.member,
    });

    expect(result.status).toBe("active");
  });

  it("rejects an empty team member update payload", () => {
    const result = teamMemberUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
