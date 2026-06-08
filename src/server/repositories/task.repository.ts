import { prisma } from "../../lib/db/prisma";
import { taskSummarySelect } from "./selects";

type TaskFindManyArgs = NonNullable<Parameters<typeof prisma.task.findMany>[0]>;
type TaskCountArgs = NonNullable<Parameters<typeof prisma.task.count>[0]>;

export async function listTasks(where?: TaskFindManyArgs["where"]) {
  return prisma.task.findMany({
    where,
    orderBy: [
      { dueDate: "asc" },
      { updatedAt: "desc" },
    ],
    select: taskSummarySelect,
  });
}

export async function countTasks(where?: TaskCountArgs["where"]) {
  return prisma.task.count({ where });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    select: taskSummarySelect,
  });
}

export async function createTask(data: Parameters<typeof prisma.task.create>[0]["data"]) {
  return prisma.task.create({
    data,
    select: taskSummarySelect,
  });
}

export async function updateTask(id: string, data: Parameters<typeof prisma.task.update>[0]["data"]) {
  return prisma.task.update({
    where: { id },
    data,
    select: taskSummarySelect,
  });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({
    where: { id },
    select: {
      id: true,
    },
  });
}
