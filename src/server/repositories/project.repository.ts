import { prisma } from "../../lib/db/prisma";
import { projectSummarySelect } from "./selects";

type ProjectFindManyArgs = NonNullable<Parameters<typeof prisma.project.findMany>[0]>;
type ProjectCountArgs = NonNullable<Parameters<typeof prisma.project.count>[0]>;

export async function listProjects(where?: ProjectFindManyArgs["where"]) {
  return prisma.project.findMany({
    where,
    orderBy: {
      updatedAt: "desc",
    },
    select: projectSummarySelect,
  });
}

export async function countProjects(where?: ProjectCountArgs["where"]) {
  return prisma.project.count({ where });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    select: projectSummarySelect,
  });
}

export async function createProject(data: Parameters<typeof prisma.project.create>[0]["data"]) {
  return prisma.project.create({
    data,
    select: projectSummarySelect,
  });
}

export async function updateProject(id: string, data: Parameters<typeof prisma.project.update>[0]["data"]) {
  return prisma.project.update({
    where: { id },
    data,
    select: projectSummarySelect,
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({
    where: { id },
    select: {
      id: true,
    },
  });
}
