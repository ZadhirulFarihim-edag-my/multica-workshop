import { createEntityId } from "../utils/ids";
import { createPageInfo, getPaginationWindow } from "../utils/pagination";
import { createConflictError, createNotFoundError } from "./errors";
import {
  countTeamMembers,
  createTeamMember,
  deleteTeamMember,
  getTeamMemberByEmail,
  getTeamMemberById,
  listTeamMembers,
  updateTeamMember,
} from "../repositories/team-member.repository";

export async function listTeamMemberSummaries(query: {
  page: number;
  pageSize: number;
  search?: string;
  status?: "active" | "inactive" | "invited";
  role?: "owner" | "admin" | "member" | "viewer";
}) {
  const where = {
    AND: [
      ...(query.search
        ? [
            {
              OR: [
                { name: { contains: query.search } },
                { email: { contains: query.search } },
                { role: { contains: query.search } },
                { notes: { contains: query.search } },
              ],
            },
          ]
        : []),
      ...(query.status ? [{ status: query.status }] : []),
      ...(query.role ? [{ role: query.role }] : []),
    ],
  } as Parameters<typeof listTeamMembers>[0];

  const { skip, take } = getPaginationWindow(query.page, query.pageSize);
  const [items, totalItems] = await Promise.all([
    listTeamMembers(where),
    countTeamMembers(where),
  ]);

  return {
    items: items.slice(skip, skip + take),
    pageInfo: createPageInfo(totalItems, query.page, query.pageSize),
  };
}

export async function getTeamMemberDetail(id: string) {
  const member = await getTeamMemberById(id);

  if (!member) {
    throw createNotFoundError("Team member not found");
  }

  return member;
}

export async function createTeamMemberRecord(input: {
  id?: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "inactive" | "invited";
  avatarUrl?: string;
  notes?: string;
}) {
  const existingEmail = await getTeamMemberByEmail(input.email);

  if (existingEmail) {
    throw createConflictError("Team member email already exists");
  }

  return createTeamMember({
    id: input.id ?? createEntityId("member"),
    name: input.name,
    email: input.email,
    role: input.role,
    status: input.status,
    avatarUrl: input.avatarUrl,
    notes: input.notes,
  });
}

export async function updateTeamMemberRecord(
  id: string,
  input: {
    name?: string;
    email?: string;
    role?: "owner" | "admin" | "member" | "viewer";
    status?: "active" | "inactive" | "invited";
    avatarUrl?: string;
    notes?: string;
  }
) {
  const existing = await getTeamMemberById(id);

  if (!existing) {
    throw createNotFoundError("Team member not found");
  }

  if (input.email && input.email !== existing.email) {
    const duplicate = await getTeamMemberByEmail(input.email);

    if (duplicate) {
      throw createConflictError("Team member email already exists");
    }
  }

  return updateTeamMember(id, input);
}

export async function deleteTeamMemberRecord(id: string) {
  const existing = await getTeamMemberById(id);

  if (!existing) {
    throw createNotFoundError("Team member not found");
  }

  return deleteTeamMember(id);
}
