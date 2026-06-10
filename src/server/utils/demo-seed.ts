import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "../../lib/db/prisma";

type DemoWorkspace = {
  projects: Array<{
    id: string;
    name: string;
    description?: string | null;
    status: "planning" | "active" | "archived";
    ownerId: string;
    color?: string | null;
  }>;
  teamMembers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
  tasks: Array<{
    id: string;
    projectId: string;
    title: string;
    description?: string | null;
    status: "todo" | "in_progress" | "review" | "blocked" | "done";
    priority: "low" | "medium" | "high" | "urgent";
    assigneeId?: string | null;
    dueDate?: string | null;
  }>;
  taskComments: Array<{
    id: string;
    taskId: string;
    body: string;
    authorId?: string | null;
    parentCommentId?: string | null;
    createdAt: string;
  }>;
  activityLogs: Array<{
    id: string;
    projectId: string;
    taskId?: string | null;
    actorId?: string | null;
    action: string;
    summary: string;
    createdAt: string;
  }>;
};

const memberRoleMap: Record<string, "owner" | "admin" | "member" | "viewer"> = {
  "System Architect": "owner",
  "Senior Backend Developer": "admin",
  "Senior Frontend Developer": "member",
  Tester: "viewer",
  "Quality Assurance": "member",
};

let seedPromise: Promise<void> | null = null;

async function readDemoWorkspace() {
  const content = await readFile(join(process.cwd(), "data", "demo-database.json"), "utf8");
  return JSON.parse(content) as DemoWorkspace;
}

export async function ensureDemoWorkspaceSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const [teamCount, projectCount, taskCount] = await Promise.all([
        prisma.teamMember.count(),
        prisma.project.count(),
        prisma.task.count(),
      ]);

      if (teamCount > 0 || projectCount > 0 || taskCount > 0) {
        return;
      }

      const workspace = await readDemoWorkspace();

      await prisma.$transaction(async (tx) => {
        await tx.teamMember.createMany({
          data: workspace.teamMembers.map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: memberRoleMap[member.name] ?? "member",
            status: "active",
            notes: member.role,
          })),
        });

        await tx.project.createMany({
          data: workspace.projects.map((project) => ({
            id: project.id,
            name: project.name,
            description: project.description ?? undefined,
            status: project.status,
            ownerId: project.ownerId,
            color: project.color ?? undefined,
          })),
        });

        await tx.task.createMany({
          data: workspace.tasks.map((task) => ({
            id: task.id,
            projectId: task.projectId,
            title: task.title,
            description: task.description ?? undefined,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId ?? undefined,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          })),
        });

        await tx.taskComment.createMany({
          data: workspace.taskComments.map((comment) => ({
            id: comment.id,
            taskId: comment.taskId,
            content: comment.body,
            authorId: comment.authorId ?? undefined,
            parentCommentId: comment.parentCommentId ?? undefined,
            createdAt: new Date(comment.createdAt),
          })),
        });

        await tx.activityLog.createMany({
          data: workspace.activityLogs.map((log) => ({
            id: log.id,
            projectId: log.projectId,
            taskId: log.taskId ?? undefined,
            actorId: log.actorId ?? undefined,
            action: log.action,
            summary: log.summary,
            createdAt: new Date(log.createdAt),
          })),
        });
      });
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  await seedPromise;
}
