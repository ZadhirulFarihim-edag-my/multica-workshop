import { createEntityId } from "../utils/ids";
import { createPageInfo, getPaginationWindow } from "../utils/pagination";
import { ensureDemoWorkspaceSeeded } from "../utils/demo-seed";
import { createNotFoundError } from "./errors";
import {
  countTasks,
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} from "../repositories/task.repository";
import { getProjectById } from "../repositories/project.repository";
import { getTeamMemberById } from "../repositories/team-member.repository";

export async function listTaskSummaries(query: {
  page: number;
  pageSize: number;
  search?: string;
  status?: "todo" | "in_progress" | "review" | "blocked" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
  projectId?: string;
  assigneeId?: string;
  dueBefore?: string;
  dueAfter?: string;
}) {
  await ensureDemoWorkspaceSeeded();

  const dueDate =
    query.dueBefore || query.dueAfter
      ? {
          ...(query.dueBefore ? { lte: new Date(query.dueBefore) } : {}),
          ...(query.dueAfter ? { gte: new Date(query.dueAfter) } : {}),
        }
      : undefined;

  const where = {
    AND: [
      ...(query.search
        ? [
            {
              OR: [
                { title: { contains: query.search } },
                { description: { contains: query.search } },
              ],
            },
          ]
        : []),
      ...(query.status ? [{ status: query.status }] : []),
      ...(query.priority ? [{ priority: query.priority }] : []),
      ...(query.projectId ? [{ projectId: query.projectId }] : []),
      ...(query.assigneeId ? [{ assigneeId: query.assigneeId }] : []),
      ...(dueDate ? [{ dueDate }] : []),
    ],
  } as Parameters<typeof listTasks>[0];

  const { skip, take } = getPaginationWindow(query.page, query.pageSize);
  const [items, totalItems] = await Promise.all([
    listTasks(where),
    countTasks(where),
  ]);

  return {
    items: items.slice(skip, skip + take),
    pageInfo: createPageInfo(totalItems, query.page, query.pageSize),
  };
}

export async function getTaskDetail(id: string) {
  await ensureDemoWorkspaceSeeded();

  const task = await getTaskById(id);

  if (!task) {
    throw createNotFoundError("Task not found");
  }

  return task;
}

export async function createTaskRecord(input: {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  projectId: string;
  assigneeId?: string;
  dueDate?: string;
}) {
  await ensureDemoWorkspaceSeeded();

  const project = await getProjectById(input.projectId);

  if (!project) {
    throw createNotFoundError("Project not found");
  }

  if (input.assigneeId) {
    const assignee = await getTeamMemberById(input.assigneeId);

    if (!assignee) {
      throw createNotFoundError("Task assignee not found");
    }
  }

  return createTask({
    id: createEntityId("task"),
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    projectId: input.projectId,
    assigneeId: input.assigneeId,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
  });
}

export async function updateTaskRecord(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    status?: "todo" | "in_progress" | "review" | "blocked" | "done";
    priority?: "low" | "medium" | "high" | "urgent";
    projectId?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
  }
) {
  await ensureDemoWorkspaceSeeded();

  const existing = await getTaskById(id);

  if (!existing) {
    throw createNotFoundError("Task not found");
  }

  if (input.projectId) {
    const project = await getProjectById(input.projectId);

    if (!project) {
      throw createNotFoundError("Project not found");
    }
  }

  if (input.assigneeId) {
    const assignee = await getTeamMemberById(input.assigneeId);

    if (!assignee) {
      throw createNotFoundError("Task assignee not found");
    }
  }

  return updateTask(id, {
    ...input,
    dueDate:
      input.dueDate === undefined ? undefined : input.dueDate ? new Date(input.dueDate) : null,
  });
}

export async function deleteTaskRecord(id: string) {
  await ensureDemoWorkspaceSeeded();

  const existing = await getTaskById(id);

  if (!existing) {
    throw createNotFoundError("Task not found");
  }

  return deleteTask(id);
}
