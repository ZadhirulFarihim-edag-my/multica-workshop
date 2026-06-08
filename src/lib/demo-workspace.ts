import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createPageInfo, type PageInfo } from "../server/utils/pagination";

type DemoWorkspace = {
  projects: Array<{
    id: string;
    name: string;
    description?: string | null;
    status: "planning" | "active" | "archived";
    ownerId: string;
    color?: string | null;
    createdAt?: string;
    updatedAt?: string;
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
    createdAt?: string;
    updatedAt?: string;
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

type DemoTeamMemberSummary = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "inactive" | "invited";
  avatarUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type DemoTeamMemberRecord = DemoTeamMemberSummary & {
  assignedTaskCount: number;
};

type DemoProjectSummary = {
  id: string;
  name: string;
  description?: string | null;
  status: "planning" | "active" | "archived";
  ownerId: string;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  owner: DemoTeamMemberSummary;
  _count: {
    tasks: number;
  };
};

type DemoTaskSummary = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "review" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeId?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    status: "planning" | "active" | "archived";
    color?: string | null;
  };
  assignee: DemoTeamMemberSummary | null;
  _count: {
    comments: number;
  };
};

type DemoCommentSummary = {
  id: string;
  taskId: string;
  content: string;
  authorId?: string | null;
  parentCommentId?: string | null;
  createdAt: string;
  updatedAt: string;
  author: DemoTeamMemberSummary | null;
  _count: {
    replies: number;
  };
};

type DemoActivityLogSummary = {
  id: string;
  projectId: string;
  taskId?: string | null;
  actorId?: string | null;
  action: string;
  summary: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
    status: "planning" | "active" | "archived";
    color?: string | null;
  };
  task: {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "review" | "blocked" | "done";
    priority: "low" | "medium" | "high" | "urgent";
  } | null;
  actor: DemoTeamMemberSummary | null;
};

const memberRoleMap: Record<string, DemoTeamMemberSummary["role"]> = {
  "System Architect": "owner",
  "Senior Backend Developer": "admin",
  "Senior Frontend Developer": "member",
  Tester: "viewer",
  "Quality Assurance": "member",
};

let workspacePromise: Promise<DemoWorkspace> | null = null;

async function loadWorkspace() {
  if (!workspacePromise) {
    workspacePromise = readFile(join(process.cwd(), "data", "demo-database.json"), "utf8").then(
      (content) => JSON.parse(content) as DemoWorkspace
    );
  }

  return workspacePromise;
}

function toTeamMemberSummary(
  member: DemoWorkspace["teamMembers"][number],
  overrides?: Partial<DemoTeamMemberSummary>
): DemoTeamMemberSummary {
  const now = new Date().toISOString();

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: memberRoleMap[member.name] ?? "member",
    status: "active",
    avatarUrl: null,
    notes: member.role,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function getPageWindow(page: number, pageSize: number) {
  const safePage = page < 1 ? 1 : page;
  const safePageSize = pageSize < 1 ? 1 : pageSize;

  return {
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
}

function toDate(value?: string | null) {
  return value ? new Date(value) : null;
}

function matchesSearch(value: string | null | undefined, search?: string) {
  if (!search) {
    return true;
  }

  return value?.toLowerCase().includes(search.toLowerCase()) ?? false;
}

function toOwnerMap(workspace: DemoWorkspace) {
  return new Map(
    workspace.teamMembers.map((member) => [member.id, toTeamMemberSummary(member)])
  );
}

function toTaskCountMap(workspace: DemoWorkspace) {
  return workspace.tasks.reduce<Map<string, number>>((accumulator, task) => {
    accumulator.set(task.projectId, (accumulator.get(task.projectId) ?? 0) + 1);
    return accumulator;
  }, new Map());
}

function toCommentCountMap(workspace: DemoWorkspace) {
  return workspace.taskComments.reduce<Map<string, number>>((accumulator, comment) => {
    accumulator.set(comment.taskId, (accumulator.get(comment.taskId) ?? 0) + 1);
    return accumulator;
  }, new Map());
}

function toReplyCountMap(workspace: DemoWorkspace) {
  return workspace.taskComments.reduce<Map<string, number>>((accumulator, comment) => {
    if (comment.parentCommentId) {
      accumulator.set(comment.parentCommentId, (accumulator.get(comment.parentCommentId) ?? 0) + 1);
    }

    return accumulator;
  }, new Map());
}

function toProjects(workspace: DemoWorkspace) {
  const owners = toOwnerMap(workspace);
  const taskCounts = toTaskCountMap(workspace);

  return workspace.projects.map<DemoProjectSummary>((project) => ({
    ...project,
    createdAt: project.createdAt ?? "2026-06-08T11:00:00Z",
    updatedAt: project.updatedAt ?? "2026-06-08T11:00:00Z",
    owner: owners.get(project.ownerId) ?? toTeamMemberSummary(workspace.teamMembers[0]),
    _count: {
      tasks: taskCounts.get(project.id) ?? 0,
    },
  }));
}

function toTasks(workspace: DemoWorkspace) {
  const projects = new Map(toProjects(workspace).map((project) => [project.id, project]));
  const members = new Map(
    workspace.teamMembers.map((member) => [member.id, toTeamMemberSummary(member)])
  );
  const commentCounts = toCommentCountMap(workspace);

  return workspace.tasks.map<DemoTaskSummary>((task) => {
    const project = projects.get(task.projectId);

    return {
      ...task,
      createdAt: task.createdAt ?? "2026-06-08T11:00:00Z",
      updatedAt: task.updatedAt ?? "2026-06-08T11:00:00Z",
      project: project
        ? {
            id: project.id,
            name: project.name,
            status: project.status,
            color: project.color,
          }
        : {
            id: task.projectId,
            name: "Unknown project",
            status: "active",
            color: null,
          },
      assignee: task.assigneeId ? members.get(task.assigneeId) ?? null : null,
      _count: {
        comments: commentCounts.get(task.id) ?? 0,
      },
    };
  });
}

function toComments(workspace: DemoWorkspace) {
  const members = new Map(
    workspace.teamMembers.map((member) => [member.id, toTeamMemberSummary(member)])
  );
  const replyCounts = toReplyCountMap(workspace);

  return workspace.taskComments.map<DemoCommentSummary>((comment) => ({
    id: comment.id,
    taskId: comment.taskId,
    content: comment.body,
    authorId: comment.authorId ?? null,
    parentCommentId: comment.parentCommentId ?? null,
    createdAt: comment.createdAt,
    updatedAt: comment.createdAt,
    author: comment.authorId ? members.get(comment.authorId) ?? null : null,
    _count: {
      replies: replyCounts.get(comment.id) ?? 0,
    },
  }));
}

function toActivityLogs(workspace: DemoWorkspace) {
  const projects = new Map(toProjects(workspace).map((project) => [project.id, project]));
  const tasks = new Map(toTasks(workspace).map((task) => [task.id, task]));
  const members = new Map(
    workspace.teamMembers.map((member) => [member.id, toTeamMemberSummary(member)])
  );

  return workspace.activityLogs.map<DemoActivityLogSummary>((log) => ({
    id: log.id,
    projectId: log.projectId,
    taskId: log.taskId ?? null,
    actorId: log.actorId ?? null,
    action: log.action,
    summary: log.summary,
    createdAt: log.createdAt,
    project: {
      id: projects.get(log.projectId)?.id ?? log.projectId,
      name: projects.get(log.projectId)?.name ?? "Unknown project",
      status: projects.get(log.projectId)?.status ?? "active",
      color: projects.get(log.projectId)?.color ?? null,
    },
    task: log.taskId
      ? tasks.get(log.taskId)
        ? {
            id: tasks.get(log.taskId)!.id,
            title: tasks.get(log.taskId)!.title,
            status: tasks.get(log.taskId)!.status,
            priority: tasks.get(log.taskId)!.priority,
          }
        : null
      : null,
    actor: log.actorId ? members.get(log.actorId) ?? null : null,
  }));
}

export async function getDashboardSnapshot() {
  const workspace = await loadWorkspace();
  const projects = toProjects(workspace);
  const tasks = toTasks(workspace);
  const members = new Map(
    workspace.teamMembers.map((member) => [member.id, toTeamMemberSummary(member)])
  );
  const comments = toComments(workspace);
  const logs = toActivityLogs(workspace);

  const summary = {
    projects: projects.length,
    tasks: tasks.length,
    teamMembers: members.size,
    comments: comments.length,
    activityLogs: logs.length,
    overdueTasks: tasks.filter((task) => {
      const dueDate = toDate(task.dueDate);

      return Boolean(dueDate && dueDate < new Date() && task.status !== "done");
    }).length,
  };

  const byStatus = {
    projects: projects.reduce<Record<string, number>>((accumulator, project) => {
      accumulator[project.status] = (accumulator[project.status] ?? 0) + 1;
      return accumulator;
    }, {}),
    tasks: tasks.reduce<Record<string, number>>((accumulator, task) => {
      accumulator[task.status] = (accumulator[task.status] ?? 0) + 1;
      return accumulator;
    }, {}),
    teamMembers: Array.from(members.values()).reduce<Record<string, number>>(
      (accumulator, member) => {
        accumulator[member.status] = (accumulator[member.status] ?? 0) + 1;
        return accumulator;
      },
      {}
    ),
  };

  const recentActivity = [...logs]
    .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
    .slice(0, 5);

  const upcomingTasks = [...tasks]
    .filter((task) => task.status !== "done")
    .sort((left, right) => {
      const leftDate = toDate(left.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
      const rightDate = toDate(right.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;

      return leftDate - rightDate;
    })
    .slice(0, 5);

  return {
    summary,
    byStatus,
    recentActivity,
    upcomingTasks,
  };
}

export async function listProjectSummaries(query: {
  page: number;
  pageSize: number;
  search?: string;
  status?: "planning" | "active" | "archived";
  ownerId?: string;
}) {
  const workspace = await loadWorkspace();
  const projects = toProjects(workspace)
    .filter((project) => matchesSearch(project.name, query.search) || matchesSearch(project.description, query.search))
    .filter((project) => (query.status ? project.status === query.status : true))
    .filter((project) => (query.ownerId ? project.ownerId === query.ownerId : true))
    .sort((left, right) => +new Date(right.updatedAt) - +new Date(left.updatedAt));

  const { skip, take } = getPageWindow(query.page, query.pageSize);
  const items = projects.slice(skip, skip + take);

  return {
    items,
    pageInfo: createPageInfo(projects.length, query.page, query.pageSize),
  };
}

export async function getProjectDetail(id: string) {
  const workspace = await loadWorkspace();
  const project = toProjects(workspace).find((item) => item.id === id);

  if (!project) {
    throw Object.assign(new Error("Project not found"), { status: 404 });
  }

  return project;
}

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
  const workspace = await loadWorkspace();
  const tasks = toTasks(workspace)
    .filter((task) => matchesSearch(task.title, query.search) || matchesSearch(task.description, query.search))
    .filter((task) => (query.status ? task.status === query.status : true))
    .filter((task) => (query.priority ? task.priority === query.priority : true))
    .filter((task) => (query.projectId ? task.projectId === query.projectId : true))
    .filter((task) => (query.assigneeId ? task.assigneeId === query.assigneeId : true))
    .filter((task) => {
      if (!query.dueBefore && !query.dueAfter) {
        return true;
      }

      const dueDate = toDate(task.dueDate);
      const before = query.dueBefore ? toDate(query.dueBefore) : null;
      const after = query.dueAfter ? toDate(query.dueAfter) : null;

      return Boolean(
        dueDate &&
          (!before || dueDate <= before) &&
          (!after || dueDate >= after)
      );
    })
    .sort((left, right) => {
      const leftDate = toDate(left.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
      const rightDate = toDate(right.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;

      if (leftDate !== rightDate) {
        return leftDate - rightDate;
      }

      return +new Date(right.updatedAt) - +new Date(left.updatedAt);
    });

  const { skip, take } = getPageWindow(query.page, query.pageSize);
  const items = tasks.slice(skip, skip + take);

  return {
    items,
    pageInfo: createPageInfo(tasks.length, query.page, query.pageSize),
  };
}

export async function getTaskDetail(id: string) {
  const workspace = await loadWorkspace();
  const task = toTasks(workspace).find((item) => item.id === id);

  if (!task) {
    throw Object.assign(new Error("Task not found"), { status: 404 });
  }

  return task;
}

export async function listTeamMemberSummaries(query: {
  page: number;
  pageSize: number;
  search?: string;
  status?: "active" | "inactive" | "invited";
  role?: "owner" | "admin" | "member" | "viewer";
}) {
  const workspace = await loadWorkspace();
  const tasks = toTasks(workspace);
  const members = workspace.teamMembers
    .map<DemoTeamMemberRecord>((member) => {
      const summary = toTeamMemberSummary(member);

      return {
        ...summary,
        assignedTaskCount: tasks.filter((task) => task.assigneeId === member.id).length,
      };
    })
    .filter((member) => matchesSearch(member.name, query.search) || matchesSearch(member.email, query.search) || matchesSearch(member.role, query.search) || matchesSearch(member.notes, query.search))
    .filter((member) => (query.status ? member.status === query.status : true))
    .filter((member) => (query.role ? member.role === query.role : true))
    .sort((left, right) => +new Date(right.updatedAt) - +new Date(left.updatedAt));

  const { skip, take } = getPageWindow(query.page, query.pageSize);
  const items = members.slice(skip, skip + take);

  return {
    items,
    pageInfo: createPageInfo(members.length, query.page, query.pageSize),
  };
}

export async function listCommentSummaries(query: {
  page: number;
  pageSize: number;
  taskId?: string;
  authorId?: string;
  parentCommentId?: string;
}) {
  const workspace = await loadWorkspace();
  const comments = toComments(workspace)
    .filter((comment) => (query.taskId ? comment.taskId === query.taskId : true))
    .filter((comment) => (query.authorId ? comment.authorId === query.authorId : true))
    .filter((comment) => (query.parentCommentId ? comment.parentCommentId === query.parentCommentId : true))
    .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt));

  const { skip, take } = getPageWindow(query.page, query.pageSize);
  const items = comments.slice(skip, skip + take);

  return {
    items,
    pageInfo: createPageInfo(comments.length, query.page, query.pageSize),
  };
}

export async function listActivityLogSummaries(query: {
  page: number;
  pageSize: number;
  projectId?: string;
  taskId?: string;
  actorId?: string;
  action?: string;
}) {
  const workspace = await loadWorkspace();
  const logs = toActivityLogs(workspace)
    .filter((log) => (query.projectId ? log.projectId === query.projectId : true))
    .filter((log) => (query.taskId ? log.taskId === query.taskId : true))
    .filter((log) => (query.actorId ? log.actorId === query.actorId : true))
    .filter((log) => (query.action ? log.action === query.action : true))
    .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt));

  const offset = (query.page - 1) * query.pageSize;
  const items = logs.slice(offset, offset + query.pageSize);

  return {
    items,
    pageInfo: createPageInfo(logs.length, query.page, query.pageSize),
  };
}
