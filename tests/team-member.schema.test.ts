import { describe, expect, it } from "vitest";
import { teamMemberUpdateSchema } from "../src/lib/validations/team-member.schema";

describe("team member validation schema", () => {
  it("rejects an empty team member update payload", () => {
    const result = teamMemberUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
