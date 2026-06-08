import { createEntityId } from "../utils/ids";
import { createPageInfo, getPaginationWindow } from "../utils/pagination";
import { createNotFoundError } from "./errors";
import {
  countProjects,
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  updateProject,
} from "../repositories/project.repository";
import { getTeamMemberById } from "../repositories/team-member.repository";

export async function listProjectSummaries(query: {
  page: number;
  pageSize: number;
  search?: string;
  status?: "planning" | "active" | "archived";
  ownerId?: string;
}) {
  const where = {
    AND: [
      ...(query.search
        ? [
            {
              OR: [
                { name: { contains: query.search } },
                { description: { contains: query.search } },
              ],
            },
          ]
        : []),
      ...(query.status ? [{ status: query.status }] : []),
      ...(query.ownerId ? [{ ownerId: query.ownerId }] : []),
    ],
  } as Parameters<typeof listProjects>[0];

  const { skip, take } = getPaginationWindow(query.page, query.pageSize);
  const [items, totalItems] = await Promise.all([
    listProjects(where),
    countProjects(where),
  ]);

  return {
    items: items.slice(skip, skip + take),
    pageInfo: createPageInfo(totalItems, query.page, query.pageSize),
  };
}

export async function getProjectDetail(id: string) {
  const project = await getProjectById(id);

  if (!project) {
    throw createNotFoundError("Project not found");
  }

  return project;
}

export async function createProjectRecord(input: {
  name: string;
  description?: string;
  ownerId: string;
  status: "planning" | "active" | "archived";
  color?: string;
}) {
  const owner = await getTeamMemberById(input.ownerId);

  if (!owner) {
    throw createNotFoundError("Project owner not found");
  }

  return createProject({
    id: createEntityId("proj"),
    name: input.name,
    description: input.description,
    ownerId: input.ownerId,
    status: input.status,
    color: input.color,
  });
}

export async function updateProjectRecord(
  id: string,
  input: {
    name?: string;
    description?: string;
    ownerId?: string;
    status?: "planning" | "active" | "archived";
    color?: string;
  }
) {
  const existing = await getProjectById(id);

  if (!existing) {
    throw createNotFoundError("Project not found");
  }

  if (input.ownerId) {
    const owner = await getTeamMemberById(input.ownerId);

    if (!owner) {
      throw createNotFoundError("Project owner not found");
    }
  }

  return updateProject(id, input);
}

export async function deleteProjectRecord(id: string) {
  const existing = await getProjectById(id);

  if (!existing) {
    throw createNotFoundError("Project not found");
  }

  return deleteProject(id);
}
