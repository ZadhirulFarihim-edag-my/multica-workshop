import { createEntityId } from "../utils/ids";
import { createPageInfo, getPaginationWindow } from "../utils/pagination";
import { ensureDemoWorkspaceSeeded } from "../utils/demo-seed";
import { createNotFoundError } from "./errors";
import {
  countComments,
  createComment,
  deleteComment,
  getCommentById,
  listComments,
  updateComment,
} from "../repositories/comment.repository";
import { getTaskById } from "../repositories/task.repository";
import { getTeamMemberById } from "../repositories/team-member.repository";

export async function listCommentSummaries(query: {
  page: number;
  pageSize: number;
  taskId?: string;
  authorId?: string;
  parentCommentId?: string;
}) {
  await ensureDemoWorkspaceSeeded();

  const where = {
    AND: [
      ...(query.taskId ? [{ taskId: query.taskId }] : []),
      ...(query.authorId ? [{ authorId: query.authorId }] : []),
      ...(query.parentCommentId ? [{ parentCommentId: query.parentCommentId }] : []),
    ],
  } as Parameters<typeof listComments>[0];

  const { skip, take } = getPaginationWindow(query.page, query.pageSize);
  const [items, totalItems] = await Promise.all([
    listComments(where),
    countComments(where),
  ]);

  return {
    items: items.slice(skip, skip + take),
    pageInfo: createPageInfo(totalItems, query.page, query.pageSize),
  };
}

export async function getCommentDetail(id: string) {
  await ensureDemoWorkspaceSeeded();

  const comment = await getCommentById(id);

  if (!comment) {
    throw createNotFoundError("Comment not found");
  }

  return comment;
}

export async function createCommentRecord(input: {
  content: string;
  taskId: string;
  parentCommentId?: string;
  authorId?: string;
}) {
  await ensureDemoWorkspaceSeeded();

  const task = await getTaskById(input.taskId);

  if (!task) {
    throw createNotFoundError("Task not found");
  }

  if (input.parentCommentId) {
    const parent = await getCommentById(input.parentCommentId);

    if (!parent) {
      throw createNotFoundError("Parent comment not found");
    }

    if (parent.taskId !== input.taskId) {
      throw createNotFoundError("Parent comment must belong to the same task");
    }
  }

  if (input.authorId) {
    const author = await getTeamMemberById(input.authorId);

    if (!author) {
      throw createNotFoundError("Comment author not found");
    }
  }

  return createComment({
    id: createEntityId("comment"),
    content: input.content,
    taskId: input.taskId,
    parentCommentId: input.parentCommentId,
    authorId: input.authorId,
  });
}

export async function updateCommentRecord(
  id: string,
  input: {
    content?: string;
  }
) {
  await ensureDemoWorkspaceSeeded();

  const existing = await getCommentById(id);

  if (!existing) {
    throw createNotFoundError("Comment not found");
  }

  return updateComment(id, input);
}

export async function deleteCommentRecord(id: string) {
  await ensureDemoWorkspaceSeeded();

  const existing = await getCommentById(id);

  if (!existing) {
    throw createNotFoundError("Comment not found");
  }

  return deleteComment(id);
}
