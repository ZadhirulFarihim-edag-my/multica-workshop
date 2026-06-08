import { prisma } from "../../lib/db/prisma";
import { commentSummarySelect } from "./selects";

type CommentFindManyArgs = NonNullable<Parameters<typeof prisma.taskComment.findMany>[0]>;
type CommentCountArgs = NonNullable<Parameters<typeof prisma.taskComment.count>[0]>;

export async function listComments(where?: CommentFindManyArgs["where"]) {
  return prisma.taskComment.findMany({
    where,
    orderBy: {
      createdAt: "asc",
    },
    select: commentSummarySelect,
  });
}

export async function countComments(where?: CommentCountArgs["where"]) {
  return prisma.taskComment.count({ where });
}

export async function getCommentById(id: string) {
  return prisma.taskComment.findUnique({
    where: { id },
    select: commentSummarySelect,
  });
}

export async function createComment(data: Parameters<typeof prisma.taskComment.create>[0]["data"]) {
  return prisma.taskComment.create({
    data,
    select: commentSummarySelect,
  });
}

export async function updateComment(id: string, data: Parameters<typeof prisma.taskComment.update>[0]["data"]) {
  return prisma.taskComment.update({
    where: { id },
    data,
    select: commentSummarySelect,
  });
}

export async function deleteComment(id: string) {
  return prisma.taskComment.delete({
    where: { id },
    select: {
      id: true,
    },
  });
}
