import { prisma } from "../../lib/db/prisma";

function reduceStatusCounts<T extends { status: string }>(
  rows: Array<T & { _count: { _all: number } }>
) {
  return rows.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.status] = row._count._all;
    return accumulator;
  }, {});
}

export async function getDashboardSnapshot() {
  const [
    projectCount,
    taskCount,
    teamMemberCount,
    commentCount,
    activityLogCount,
    projectStatusRows,
    taskStatusRows,
    teamMemberStatusRows,
    recentActivity,
    upcomingTasks,
    overdueTaskCount,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.task.count(),
    prisma.teamMember.count(),
    prisma.taskComment.count(),
    prisma.activityLog.count(),
    prisma.project.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
    prisma.task.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
    prisma.teamMember.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
    prisma.activityLog.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        projectId: true,
        taskId: true,
        actorId: true,
        action: true,
        summary: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            color: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            avatarUrl: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        dueDate: {
          gte: new Date(),
        },
        status: {
          not: "done",
        },
      },
      take: 5,
      orderBy: {
        dueDate: "asc",
      },
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        assigneeId: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.task.count({
      where: {
        dueDate: {
          lt: new Date(),
        },
        status: {
          not: "done",
        },
      },
    }),
  ]);

  return {
    summary: {
      projects: projectCount,
      tasks: taskCount,
      teamMembers: teamMemberCount,
      comments: commentCount,
      activityLogs: activityLogCount,
      overdueTasks: overdueTaskCount,
    },
    byStatus: {
      projects: reduceStatusCounts(projectStatusRows),
      tasks: reduceStatusCounts(taskStatusRows),
      teamMembers: reduceStatusCounts(teamMemberStatusRows),
    },
    recentActivity,
    upcomingTasks,
  };
}
