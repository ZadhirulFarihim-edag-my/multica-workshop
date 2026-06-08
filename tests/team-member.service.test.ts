import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../src/lib/utils/api-error.js";
import { teamMemberCreateSchema } from "../src/lib/validations/team-member.schema";
import { createTeamMemberService } from "../src/server/services/team-member.service";
import type {
  TeamMemberRecord,
  TeamMemberRepository,
} from "../src/server/repositories/team-member.repository";

function createRecord(overrides: Partial<TeamMemberRecord> = {}): TeamMemberRecord {
  return {
    id: "member-1",
    name: "Alex Morgan",
    email: "alex@example.com",
    role: "Backend Engineer",
    status: "active",
    avatarUrl: null,
    notes: null,
    createdAt: new Date("2026-06-08T10:00:00Z"),
    updatedAt: new Date("2026-06-08T10:15:00Z"),
    _count: {
      assignedTasks: 2,
    },
    ...overrides,
  };
}

function createRepository(overrides: Partial<TeamMemberRepository> = {}): TeamMemberRepository {
  return {
    listTeamMembers: vi.fn().mockResolvedValue([]),
    findTeamMemberById: vi.fn().mockResolvedValue(null),
    findTeamMemberByEmail: vi.fn().mockResolvedValue(null),
    createTeamMember: vi.fn().mockResolvedValue(createRecord()),
    updateTeamMember: vi.fn().mockResolvedValue(createRecord()),
    ...overrides,
  };
}

describe("team member service", () => {
  it("returns team members with assigned task counts and timestamps", async () => {
    const repository = createRepository({
      listTeamMembers: vi.fn().mockResolvedValue([
        createRecord(),
        createRecord({
          id: "member-2",
          email: "jordan@example.com",
          name: "Jordan Lee",
          _count: {
            assignedTasks: 0,
          },
        }),
      ]),
    });

    const service = createTeamMemberService(repository);
    const result = await service.listTeamMembers();

    expect(result).toEqual({
      items: [
        {
          id: "member-1",
          name: "Alex Morgan",
          email: "alex@example.com",
          role: "Backend Engineer",
          status: "active",
          avatarUrl: null,
          notes: null,
          assignedTaskCount: 2,
          createdAt: "2026-06-08T10:00:00.000Z",
          updatedAt: "2026-06-08T10:15:00.000Z",
        },
        {
          id: "member-2",
          name: "Jordan Lee",
          email: "jordan@example.com",
          role: "Backend Engineer",
          status: "active",
          avatarUrl: null,
          notes: null,
          assignedTaskCount: 0,
          createdAt: "2026-06-08T10:00:00.000Z",
          updatedAt: "2026-06-08T10:15:00.000Z",
        },
      ],
      total: 2,
    });
  });

  it("creates team members using the parsed create schema", async () => {
    const parsed = teamMemberCreateSchema.parse({
      name: "Alex Morgan",
      email: "alex@example.com",
      role: "Backend Engineer",
    });

    const createTeamMember = vi.fn().mockResolvedValue(createRecord());
    const repository = createRepository({
      createTeamMember,
    });
    const service = createTeamMemberService(repository);

    const result = await service.createTeamMember(parsed);

    expect(createTeamMember).toHaveBeenCalledWith({
      name: "Alex Morgan",
      email: "alex@example.com",
      role: "Backend Engineer",
      status: "active",
    });
    expect(result).toMatchObject({
      id: "member-1",
      assignedTaskCount: 2,
    });
  });

  it("rejects duplicate emails before write operations", async () => {
    const repository = createRepository({
      findTeamMemberByEmail: vi.fn().mockResolvedValue(createRecord()),
    });
    const service = createTeamMemberService(repository);

    await expect(
      service.createTeamMember(
        teamMemberCreateSchema.parse({
          name: "Alex Morgan",
          email: "alex@example.com",
          role: "Backend Engineer",
        }),
      ),
    ).rejects.toMatchObject<ApiError>({
      status: 409,
      code: "CONFLICT",
      message: "Team member email already exists",
    });
  });

  it("returns not found when updating a missing member", async () => {
    const service = createTeamMemberService(createRepository());

    await expect(
      service.updateTeamMember("missing-member", {
        name: "Alex Morgan",
      }),
    ).rejects.toMatchObject<ApiError>({
      status: 404,
      code: "NOT_FOUND",
      message: "Team member not found",
    });
  });

  it("deactivates a member without changing an already inactive record", async () => {
    const repository = createRepository({
      findTeamMemberById: vi.fn().mockResolvedValue(
        createRecord({
          status: "inactive",
        }),
      ),
      updateTeamMember: vi.fn(),
    });
    const service = createTeamMemberService(repository);

    const result = await service.deactivateTeamMember("member-1");

    expect(repository.updateTeamMember).not.toHaveBeenCalled();
    expect(result.status).toBe("inactive");
    expect(result.assignedTaskCount).toBe(2);
  });

  it("throws not found when deactivating a missing member", async () => {
    const service = createTeamMemberService(createRepository());

    await expect(service.deactivateTeamMember("missing-member")).rejects.toMatchObject<ApiError>({
      status: 404,
      code: "NOT_FOUND",
      message: "Team member not found",
    });
  });
});
