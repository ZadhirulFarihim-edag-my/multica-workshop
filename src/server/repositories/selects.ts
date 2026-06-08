export const teamMemberSummarySelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  avatarUrl: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const projectSummarySelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  ownerId: true,
  color: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: teamMemberSummarySelect,
  },
  _count: {
    select: {
      tasks: true,
    },
  },
} as const;

export const taskSummarySelect = {
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
  project: {
    select: {
      id: true,
      name: true,
      status: true,
      color: true,
    },
  },
  assignee: {
    select: teamMemberSummarySelect,
  },
  _count: {
    select: {
      comments: true,
    },
  },
} as const;

export const commentSummarySelect = {
  id: true,
  taskId: true,
  content: true,
  authorId: true,
  parentCommentId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: teamMemberSummarySelect,
  },
  _count: {
    select: {
      replies: true,
    },
  },
} as const;

export const activityLogSummarySelect = {
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
    select: teamMemberSummarySelect,
  },
} as const;
