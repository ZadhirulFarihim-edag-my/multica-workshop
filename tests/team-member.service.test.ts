import { describe, expect, it, vi, beforeEach } from "vitest";

const repoMocks = vi.hoisted(() => ({
  listTeamMembers: vi.fn(),
  countTeamMembers: vi.fn(),
  getTeamMemberById: vi.fn(),
  getTeamMemberByEmail: vi.fn(),
  createTeamMember: vi.fn(),
  updateTeamMember: vi.fn(),
  deleteTeamMember: vi.fn(),
}));

const idsMocks = vi.hoisted(() => ({
  createEntityId: vi.fn(() => "member-test-id"),
}));

vi.mock("../src/server/repositories/team-member.repository.js", () => repoMocks);
vi.mock("../src/server/utils/ids.js", () => idsMocks);

import {
  createTeamMemberRecord,
  deleteTeamMemberRecord,
  getTeamMemberDetail,
  listTeamMemberSummaries,
  updateTeamMemberRecord,
} from "../src/server/services/team-member.service.js";

type TeamMemberRecord = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "inactive" | "invited";
  avatarUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    ownedProjects: number;
    assignedTasks: number;
    authoredComments: number;
    authoredLogs: number;
  };
};

function createRecord(overrides: Partial<TeamMemberRecord> = {}): TeamMemberRecord {
  return {
    id: "member-1",
    name: "Alex Morgan",
    email: "alex@example.com",
    role: "member",
    status: "active",
    avatarUrl: null,
    notes: null,
    createdAt: new Date("2026-06-08T10:00:00Z"),
    updatedAt: new Date("2026-06-08T10:15:00Z"),
    _count: {
      ownedProjects: 1,
      assignedTasks: 2,
      authoredComments: 3,
      authoredLogs: 4,
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  repoMocks.listTeamMembers.mockResolvedValue([]);
  repoMocks.countTeamMembers.mockResolvedValue(0);
  repoMocks.getTeamMemberById.mockResolvedValue(null);
  repoMocks.getTeamMemberByEmail.mockResolvedValue(null);
  repoMocks.createTeamMember.mockResolvedValue(createRecord());
  repoMocks.updateTeamMember.mockResolvedValue(createRecord());
  repoMocks.deleteTeamMember.mockResolvedValue(createRecord({ status: "inactive" }));
});

describe("team member service", () => {
  it("returns team members with assigned task counts and pagination metadata", async () => {
    repoMocks.listTeamMembers.mockResolvedValue([
      createRecord(),
      createRecord({
        id: "member-2",
        email: "jordan@example.com",
        name: "Jordan Lee",
        _count: {
          ownedProjects: 0,
          assignedTasks: 0,
          authoredComments: 0,
          authoredLogs: 0,
        },
      }),
    ]);
    repoMocks.countTeamMembers.mockResolvedValue(2);

    const result = await listTeamMemberSummaries({
      page: 1,
      pageSize: 10,
    });

    expect(result).toEqual({
      items: [
        expect.objectContaining({
          id: "member-1",
          assignedTaskCount: 2,
        }),
        expect.objectContaining({
          id: "member-2",
          assignedTaskCount: 0,
        }),
      ],
      pageInfo: {
        page: 1,
        pageSize: 10,
        totalItems: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it("creates a new team member with a generated id when one is not provided", async () => {
    const result = await createTeamMemberRecord({
      name: "Demo Member",
      email: "demo@example.com",
      role: "member",
      status: "active",
    });

    expect(idsMocks.createEntityId).toHaveBeenCalledWith("member");
    expect(repoMocks.createTeamMember).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "member-test-id",
        email: "demo@example.com",
        status: "active",
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        assignedTaskCount: 2,
      }),
    );
  });

  it("rejects duplicate emails before create writes", async () => {
    repoMocks.getTeamMemberByEmail.mockResolvedValue({ id: "member-2", email: "demo@example.com" });

    await expect(
      createTeamMemberRecord({
        name: "Demo Member",
        email: "demo@example.com",
        role: "member",
        status: "active",
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
      message: "Team member email already exists",
    });
  });

  it("returns not found when updating a missing member", async () => {
    await expect(
      updateTeamMemberRecord("missing-member", {
        name: "Demo Member",
      }),
    ).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "Team member not found",
    });
  });

  it("soft-deletes a member by marking it inactive", async () => {
    repoMocks.getTeamMemberById.mockResolvedValue(createRecord());

    const result = await deleteTeamMemberRecord("member-1");

    expect(repoMocks.deleteTeamMember).toHaveBeenCalledWith("member-1");
    expect(result).toEqual(
      expect.objectContaining({
        status: "inactive",
        assignedTaskCount: 2,
      }),
    );
  });

  it("returns not found when deleting a missing member", async () => {
    await expect(deleteTeamMemberRecord("missing-member")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "Team member not found",
    });
  });

  it("returns a mapped detail record with assigned task count", async () => {
    repoMocks.getTeamMemberById.mockResolvedValue(createRecord());

    const result = await getTeamMemberDetail("member-1");

    expect(result).toEqual(
      expect.objectContaining({
        id: "member-1",
        assignedTaskCount: 2,
      }),
    );
  });
});
