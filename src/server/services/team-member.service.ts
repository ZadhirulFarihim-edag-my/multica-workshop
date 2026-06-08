import { Prisma } from "../../generated/prisma/client.js";
import { ApiError } from "../../lib/utils/api-error.js";
import type {
  TeamMemberCreateInput,
  TeamMemberUpdateInput,
} from "../../lib/validations/team-member.schema";
import {
  createPrismaTeamMemberRepository,
  type TeamMemberRecord,
  type TeamMemberRepository,
} from "../repositories/team-member.repository";

export type TeamMemberDto = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "invited";
  avatarUrl: string | null;
  notes: string | null;
  assignedTaskCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TeamMemberListResult = {
  items: TeamMemberDto[];
  total: number;
};

function toTeamMemberDto(record: TeamMemberRecord): TeamMemberDto {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    status: record.status,
    avatarUrl: record.avatarUrl,
    notes: record.notes,
    assignedTaskCount: record._count.assignedTasks,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function isKnownPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

function throwNotFoundError(): never {
  throw new ApiError({
    status: 404,
    code: "NOT_FOUND",
    message: "Team member not found",
  });
}

function throwConflictError(): never {
  throw new ApiError({
    status: 409,
    code: "CONFLICT",
    message: "Team member email already exists",
  });
}

function mapPrismaError(error: unknown): never {
  if (isKnownPrismaError(error)) {
    if (error.code === "P2002") {
      throwConflictError();
    }

    if (error.code === "P2025") {
      throwNotFoundError();
    }
  }

  throw error;
}

export function createTeamMemberService(
  repository: TeamMemberRepository = createPrismaTeamMemberRepository(),
) {
  return {
    async listTeamMembers(): Promise<TeamMemberListResult> {
      const items = await repository.listTeamMembers();

      return {
        items: items.map(toTeamMemberDto),
        total: items.length,
      };
    },

    async getTeamMember(id: string): Promise<TeamMemberDto> {
      const teamMember = await repository.findTeamMemberById(id);

      if (!teamMember) {
        throwNotFoundError();
      }

      return toTeamMemberDto(teamMember);
    },

    async createTeamMember(input: TeamMemberCreateInput): Promise<TeamMemberDto> {
      const existing = await repository.findTeamMemberByEmail(input.email);

      if (existing) {
        throwConflictError();
      }

      try {
        const teamMember = await repository.createTeamMember(input);
        return toTeamMemberDto(teamMember);
      } catch (error) {
        return mapPrismaError(error);
      }
    },

    async updateTeamMember(
      id: string,
      input: TeamMemberUpdateInput,
    ): Promise<TeamMemberDto> {
      const existing = await repository.findTeamMemberById(id);

      if (!existing) {
        throwNotFoundError();
      }

      if (input.email && input.email !== existing.email) {
        const conflictingMember = await repository.findTeamMemberByEmail(
          input.email,
        );

        if (conflictingMember && conflictingMember.id !== id) {
          throwConflictError();
        }
      }

      try {
        const teamMember = await repository.updateTeamMember(id, input);
        return toTeamMemberDto(teamMember);
      } catch (error) {
        return mapPrismaError(error);
      }
    },

    async deactivateTeamMember(id: string): Promise<TeamMemberDto> {
      const existing = await repository.findTeamMemberById(id);

      if (!existing) {
        throwNotFoundError();
      }

      if (existing.status === "inactive") {
        return toTeamMemberDto(existing);
      }

      try {
        const teamMember = await repository.updateTeamMember(id, {
          status: "inactive",
        });
        return toTeamMemberDto(teamMember);
      } catch (error) {
        return mapPrismaError(error);
      }
    },
  };
}
