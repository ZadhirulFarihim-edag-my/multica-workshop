import { prisma } from "../../lib/db/prisma";

export type TeamMemberRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "invited";
  avatarUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    assignedTasks: number;
  };
};

export type TeamMemberCreateData = {
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "invited";
  avatarUrl?: string | null;
  notes?: string | null;
};

export type TeamMemberUpdateData = Partial<TeamMemberCreateData>;

const teamMemberInclude = {
  _count: {
    select: {
      assignedTasks: true,
    },
  },
} as const;

export interface TeamMemberRepository {
  listTeamMembers(): Promise<TeamMemberRecord[]>;
  findTeamMemberById(id: string): Promise<TeamMemberRecord | null>;
  findTeamMemberByEmail(email: string): Promise<TeamMemberRecord | null>;
  createTeamMember(data: TeamMemberCreateData): Promise<TeamMemberRecord>;
  updateTeamMember(id: string, data: TeamMemberUpdateData): Promise<TeamMemberRecord>;
}

export function createPrismaTeamMemberRepository(
  client = prisma,
): TeamMemberRepository {
  return {
    async listTeamMembers() {
      return client.teamMember.findMany({
        orderBy: [
          {
            name: "asc",
          },
        ],
        include: teamMemberInclude,
      });
    },
    async findTeamMemberById(id: string) {
      return client.teamMember.findUnique({
        where: {
          id,
        },
        include: teamMemberInclude,
      });
    },
    async findTeamMemberByEmail(email: string) {
      return client.teamMember.findUnique({
        where: {
          email,
        },
        include: teamMemberInclude,
      });
    },
    async createTeamMember(data: TeamMemberCreateData) {
      return client.teamMember.create({
        data,
        include: teamMemberInclude,
      });
    },
    async updateTeamMember(id: string, data: TeamMemberUpdateData) {
      return client.teamMember.update({
        where: {
          id,
        },
        data,
        include: teamMemberInclude,
      });
    },
  };
}

