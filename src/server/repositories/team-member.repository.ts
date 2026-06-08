import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/db/prisma";
import { teamMemberSummarySelect } from "./selects";

const teamMemberWithCountsSelect = {
  ...teamMemberSummarySelect,
  _count: {
    select: {
      ownedProjects: true,
      assignedTasks: true,
      authoredComments: true,
      authoredLogs: true,
    },
  },
} as const;

export type TeamMemberRecord = Prisma.TeamMemberGetPayload<{
  select: typeof teamMemberWithCountsSelect;
}>;

type TeamMemberFindManyArgs = NonNullable<
  Parameters<typeof prisma.teamMember.findMany>[0]
>;
type TeamMemberCountArgs = NonNullable<
  Parameters<typeof prisma.teamMember.count>[0]
>;

export async function listTeamMembers(where?: TeamMemberFindManyArgs["where"]) {
  return prisma.teamMember.findMany({
    where,
    orderBy: {
      updatedAt: "desc",
    },
    select: teamMemberWithCountsSelect,
  });
}

export async function countTeamMembers(where?: TeamMemberCountArgs["where"]) {
  return prisma.teamMember.count({ where });
}

export async function getTeamMemberById(id: string) {
  return prisma.teamMember.findUnique({
    where: { id },
    select: teamMemberWithCountsSelect,
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

export async function createTeamMember(
  data: Parameters<typeof prisma.teamMember.create>[0]["data"],
) {
  return prisma.teamMember.create({
    data,
    select: teamMemberWithCountsSelect,
  });
}

export async function updateTeamMember(
  id: string,
  data: Parameters<typeof prisma.teamMember.update>[0]["data"],
) {
  return prisma.teamMember.update({
    where: { id },
    data,
    select: teamMemberWithCountsSelect,
  });
}

export async function deleteTeamMember(id: string) {
  return prisma.teamMember.update({
    where: { id },
    data: {
      status: "inactive",
    },
    select: teamMemberWithCountsSelect,
  });
}
