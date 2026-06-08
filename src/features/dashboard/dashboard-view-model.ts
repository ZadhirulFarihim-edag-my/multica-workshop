export type CountByName = Record<string, number>;

export type DashboardTask = {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigneeId: string | null;
  dueDate: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DashboardActivity = {
  id: string;
  projectId: string | null;
  taskId: string | null;
  actorId: string | null;
  action: string;
  summary: string;
  createdAt: string | Date;
  project: {
    id: string;
    name: string;
    status: string;
    color: string | null;
  } | null;
  task: {
    id: string;
    title: string;
    status: string;
    priority: string;
  } | null;
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatarUrl: string | null;
    notes: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  } | null;
};

export type DashboardSnapshot = {
  summary: {
    projects: number;
    tasks: number;
    teamMembers: number;
    comments: number;
    activityLogs: number;
    overdueTasks: number;
  };
  byStatus: {
    projects: CountByName;
    tasks: CountByName;
    teamMembers: CountByName;
  };
  recentActivity: DashboardActivity[];
  upcomingTasks: DashboardTask[];
};

export type DashboardMetric = {
  label: string;
  value: number;
  detail: string;
};

export type DashboardListItem = {
  id: string;
  title: string;
  meta?: string;
  status?: string;
  priority?: string;
  dueLabel?: string;
};

export type DashboardViewModel = {
  metrics: DashboardMetric[];
  taskStatuses: Array<{ label: string; value: number }>;
  priorityOverview: Array<{ label: string; value: number }>;
  blockedTasks: DashboardListItem[];
  upcomingTasks: DashboardListItem[];
  recentActivity: DashboardListItem[];
  isEmpty: boolean;
};

const taskStatusOrder = ["todo", "in_progress", "blocked", "done"];
const priorityOrder = ["urgent", "high", "medium", "low"];

export function createDashboardViewModel(snapshot: DashboardSnapshot): DashboardViewModel {
  const taskStatuses = orderedCounts(snapshot.byStatus.tasks, taskStatusOrder);
  const priorityOverview = createPriorityOverview(snapshot);
  const blockedCount = snapshot.byStatus.tasks.blocked ?? 0;

  return {
    metrics: [
      {
        label: "Projects",
        value: snapshot.summary.projects,
        detail: `${snapshot.byStatus.projects.active ?? 0} active`,
      },
      {
        label: "Tasks",
        value: snapshot.summary.tasks,
        detail: `${snapshot.byStatus.tasks.todo ?? 0} todo`,
      },
      {
        label: "Team",
        value: snapshot.summary.teamMembers,
        detail: `${snapshot.byStatus.teamMembers.active ?? 0} active`,
      },
      {
        label: "Overdue",
        value: snapshot.summary.overdueTasks,
        detail: snapshot.summary.overdueTasks > 0 ? "Needs attention" : "Clear",
      },
    ],
    taskStatuses,
    priorityOverview,
    blockedTasks:
      blockedCount > 0
        ? [
            {
              id: "blocked",
              title: "Blocked tasks",
              status: "blocked",
              priority: priorityOverview[0]?.label.toLowerCase() ?? "normal",
            },
          ]
        : [],
    upcomingTasks: snapshot.upcomingTasks.map((task) => ({
      id: task.id,
      title: task.title,
      meta: task.description ?? undefined,
      status: task.status,
      priority: task.priority,
      dueLabel: formatDate(task.dueDate),
    })),
    recentActivity: snapshot.recentActivity.map((activity) => ({
      id: activity.id,
      title: activity.summary,
      meta: [activity.actor?.name, activity.project?.name ?? activity.task?.title]
        .filter(Boolean)
        .join(" · "),
      status: activity.action,
    })),
    isEmpty:
      snapshot.summary.projects === 0 &&
      snapshot.summary.tasks === 0 &&
      snapshot.summary.teamMembers === 0 &&
      snapshot.recentActivity.length === 0 &&
      snapshot.upcomingTasks.length === 0,
  };
}

function orderedCounts(counts: CountByName, order: string[]) {
  return [
    ...order.filter((key) => counts[key] !== undefined),
    ...Object.keys(counts).filter((key) => !order.includes(key)).sort(),
  ].map((key) => ({
    label: formatLabel(key),
    value: counts[key] ?? 0,
  }));
}

function createPriorityOverview(snapshot: DashboardSnapshot) {
  const counts = new Map<string, number>();

  for (const task of snapshot.upcomingTasks) {
    counts.set(task.priority, (counts.get(task.priority) ?? 0) + 1);
  }

  for (const activity of snapshot.recentActivity) {
    const priority = activity.task?.priority;
    if (priority) {
      counts.set(priority, (counts.get(priority) ?? 0) + 1);
    }
  }

  return [
    ...priorityOrder.filter((priority) => counts.has(priority)),
    ...Array.from(counts.keys()).filter((priority) => !priorityOrder.includes(priority)).sort(),
  ].map((priority) => ({
    label: formatLabel(priority),
    value: counts.get(priority) ?? 0,
  }));
}

function formatLabel(value: string) {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | Date | null) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
