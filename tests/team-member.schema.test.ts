import { describe, expect, it } from "vitest";
import { teamMemberCreateSchema, teamMemberUpdateSchema } from "../src/lib/validations/team-member.schema";

describe("team member validation schema", () => {
  it("accepts a team member create payload", () => {
    const result = teamMemberCreateSchema.safeParse({
      name: "Demo Member",
      email: "demo@example.com",
      role: "member",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty team member update payload", () => {
    const result = teamMemberUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
