import { prisma } from "../../lib/db/prisma";
import { teamMemberSummarySelect } from "./selects";

type TeamMemberFindManyArgs = NonNullable<Parameters<typeof prisma.teamMember.findMany>[0]>;
type TeamMemberCountArgs = NonNullable<Parameters<typeof prisma.teamMember.count>[0]>;

export async function listTeamMembers(where?: TeamMemberFindManyArgs["where"]) {
  return prisma.teamMember.findMany({
    where,
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      ...teamMemberSummarySelect,
      _count: {
        select: {
          ownedProjects: true,
          assignedTasks: true,
          authoredComments: true,
          authoredLogs: true,
        },
      },
    },
  });
}

export async function countTeamMembers(where?: TeamMemberCountArgs["where"]) {
  return prisma.teamMember.count({ where });
}

export async function getTeamMemberById(id: string) {
  return prisma.teamMember.findUnique({
    where: { id },
    select: {
      ...teamMemberSummarySelect,
      _count: {
        select: {
          ownedProjects: true,
          assignedTasks: true,
          authoredComments: true,
          authoredLogs: true,
        },
      },
    },
  });
}

export async function getTeamMemberByEmail(email: string) {
  return prisma.teamMember.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
    },
  });
}

export async function createTeamMember(data: Parameters<typeof prisma.teamMember.create>[0]["data"]) {
  return prisma.teamMember.create({
    data,
    select: {
      ...teamMemberSummarySelect,
      _count: {
        select: {
          ownedProjects: true,
          assignedTasks: true,
          authoredComments: true,
          authoredLogs: true,
        },
      },
    },
  });
}

export async function updateTeamMember(id: string, data: Parameters<typeof prisma.teamMember.update>[0]["data"]) {
  return prisma.teamMember.update({
    where: { id },
    data,
    select: {
      ...teamMemberSummarySelect,
      _count: {
        select: {
          ownedProjects: true,
          assignedTasks: true,
          authoredComments: true,
          authoredLogs: true,
        },
      },
    },
  });
}

export async function deleteTeamMember(id: string) {
  return prisma.teamMember.delete({
    where: { id },
    select: {
      id: true,
    },
  });
}
