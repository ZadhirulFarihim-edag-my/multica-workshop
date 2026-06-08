import { describe, expect, it } from "vitest";
import {
  createDashboardViewModel,
  type DashboardSnapshot,
} from "../src/features/dashboard/dashboard-view-model";

const snapshot: DashboardSnapshot = {
  summary: {
    projects: 4,
    tasks: 12,
    teamMembers: 3,
    comments: 9,
    activityLogs: 6,
    overdueTasks: 2,
  },
  byStatus: {
    projects: {
      active: 3,
      archived: 1,
    },
    tasks: {
      todo: 4,
      in_progress: 3,
      blocked: 2,
      done: 3,
    },
    teamMembers: {
      active: 2,
      inactive: 1,
    },
  },
  recentActivity: [
    {
      id: "activity-1",
      action: "task.created",
      summary: "Created API integration task",
      createdAt: "2026-06-08T12:00:00.000Z",
      project: { id: "project-1", name: "Command Center", status: "active", color: "#0f766e" },
      task: { id: "task-1", title: "Build dashboard", status: "in_progress", priority: "high" },
      actor: { id: "member-1", name: "Ava", email: "ava@example.com", role: "Lead", status: "active", avatarUrl: null, notes: null, createdAt: "2026-06-01T00:00:00.000Z", updatedAt: "2026-06-01T00:00:00.000Z" },
      projectId: "project-1",
      taskId: "task-1",
      actorId: "member-1",
    },
  ],
  upcomingTasks: [
    {
      id: "task-2",
      projectId: "project-1",
      title: "Review metrics",
      description: "Validate dashboard totals",
      status: "todo",
      priority: "medium",
      assigneeId: "member-1",
      dueDate: "2026-06-09T09:00:00.000Z",
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
  ],
};

describe("createDashboardViewModel", () => {
  it("maps the dashboard API snapshot into dashboard sections", () => {
    const viewModel = createDashboardViewModel(snapshot);

    expect(viewModel.metrics).toEqual([
      { label: "Projects", value: 4, detail: "3 active" },
      { label: "Tasks", value: 12, detail: "4 todo" },
      { label: "Team", value: 3, detail: "2 active" },
      { label: "Overdue", value: 2, detail: "Needs attention" },
    ]);
    expect(viewModel.taskStatuses).toEqual([
      { label: "Todo", value: 4 },
      { label: "In Progress", value: 3 },
      { label: "Blocked", value: 2 },
      { label: "Done", value: 3 },
    ]);
    expect(viewModel.priorityOverview).toEqual([
      { label: "High", value: 1 },
      { label: "Medium", value: 1 },
    ]);
    expect(viewModel.blockedTasks).toEqual([
      {
        id: "blocked",
        title: "Blocked tasks",
        status: "blocked",
        priority: "high",
      },
    ]);
    expect(viewModel.upcomingTasks[0]).toMatchObject({
      id: "task-2",
      title: "Review metrics",
      dueLabel: "Jun 9, 2026",
    });
    expect(viewModel.recentActivity[0]).toMatchObject({
      id: "activity-1",
      title: "Created API integration task",
      meta: "Ava · Command Center",
    });
    expect(viewModel.isEmpty).toBe(false);
  });

  it("detects an empty dashboard snapshot", () => {
    const viewModel = createDashboardViewModel({
      summary: {
        projects: 0,
        tasks: 0,
        teamMembers: 0,
        comments: 0,
        activityLogs: 0,
        overdueTasks: 0,
      },
      byStatus: {
        projects: {},
        tasks: {},
        teamMembers: {},
      },
      recentActivity: [],
      upcomingTasks: [],
    });

    expect(viewModel.isEmpty).toBe(true);
  });
});
