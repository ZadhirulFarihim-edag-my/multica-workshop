"use client";

import { useEffect, useState } from "react";
import { Panel } from "../../components/ui/panel";
import { fetchDashboardSummary } from "./dashboard-api";
import {
  createDashboardViewModel,
  type DashboardListItem,
  type DashboardSnapshot,
  type DashboardViewModel,
} from "./dashboard-view-model";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; snapshot: DashboardSnapshot };

export function DashboardClient() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setState({ status: "loading" });

      try {
        const snapshot = await fetchDashboardSummary();
        if (!ignore) {
          setState({ status: "ready", snapshot });
        }
      } catch (error) {
        if (!ignore) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Unable to load dashboard",
          });
        }
      }
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, [retryKey]);

  if (state.status === "loading") {
    return <DashboardLoadingState />;
  }

  if (state.status === "error") {
    return (
      <DashboardShell>
        <Panel title="Dashboard unavailable" eyebrow="Error">
          <div className="empty-state empty-state--error">
            <p>{state.message}</p>
            <button type="button" onClick={() => setRetryKey((current) => current + 1)}>
              Retry
            </button>
          </div>
        </Panel>
      </DashboardShell>
    );
  }

  const viewModel = createDashboardViewModel(state.snapshot);

  if (viewModel.isEmpty) {
    return (
      <DashboardShell>
        <Panel title="No dashboard data yet" eyebrow="Empty">
          <div className="empty-state">
            <p>Projects, tasks, team members, and activity will appear here once records exist.</p>
          </div>
        </Panel>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <MetricGrid viewModel={viewModel} />
      <div className="dashboard-grid dashboard-grid--split">
        <OverviewPanel title="Task status" items={viewModel.taskStatuses} />
        <OverviewPanel title="Priority overview" items={viewModel.priorityOverview} />
      </div>
      <div className="dashboard-grid dashboard-grid--main">
        <TaskListPanel title="Blocked tasks" eyebrow="Risk" items={viewModel.blockedTasks} emptyText="No blocked tasks." />
        <TaskListPanel title="Upcoming due tasks" eyebrow="Schedule" items={viewModel.upcomingTasks} emptyText="No upcoming due tasks." />
        <ActivityPanel items={viewModel.recentActivity} />
      </div>
    </DashboardShell>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <p className="dashboard-kicker">Developer Command Center</p>
          <h1>Dashboard Overview</h1>
        </div>
        <p className="dashboard-hero__copy">Live operational signal from projects, tasks, team activity, and delivery risk.</p>
      </header>
      {children}
    </main>
  );
}

function DashboardLoadingState() {
  return (
    <DashboardShell>
      <div className="metric-grid" aria-label="Dashboard loading">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="metric-card metric-card--loading" key={index}>
            <span />
            <strong />
            <em />
          </div>
        ))}
      </div>
      <div className="dashboard-grid dashboard-grid--split">
        <Panel title="Task status">
          <SkeletonRows />
        </Panel>
        <Panel title="Priority overview">
          <SkeletonRows />
        </Panel>
      </div>
    </DashboardShell>
  );
}

function MetricGrid({ viewModel }: { viewModel: DashboardViewModel }) {
  return (
    <div className="metric-grid">
      {viewModel.metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <em>{metric.detail}</em>
        </article>
      ))}
    </div>
  );
}

function OverviewPanel({ title, items }: { title: string; items: Array<{ label: string; value: number }> }) {
  return (
    <Panel title={title}>
      {items.length > 0 ? (
        <div className="status-list">
          {items.map((item) => (
            <div className="status-row" key={item.label}>
              <span>{item.label}</span>
              <meter min={0} max={Math.max(...items.map((entry) => entry.value), 1)} value={item.value} />
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="panel-empty">No records yet.</p>
      )}
    </Panel>
  );
}

function TaskListPanel({
  title,
  eyebrow,
  items,
  emptyText,
}: {
  title: string;
  eyebrow: string;
  items: DashboardListItem[];
  emptyText: string;
}) {
  return (
    <Panel title={title} eyebrow={eyebrow}>
      {items.length > 0 ? (
        <div className="item-list">
          {items.map((item) => (
            <article className="list-item" key={item.id}>
              <div>
                <h3>{item.title}</h3>
                {item.meta && <p>{item.meta}</p>}
              </div>
              <div className="item-tags">
                {item.priority && <span>{item.priority}</span>}
                {item.dueLabel && <span>{item.dueLabel}</span>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="panel-empty">{emptyText}</p>
      )}
    </Panel>
  );
}

function ActivityPanel({ items }: { items: DashboardListItem[] }) {
  return (
    <Panel title="Recent activity" eyebrow="Feed" className="activity-panel">
      {items.length > 0 ? (
        <div className="activity-list">
          {items.map((item) => (
            <article className="activity-item" key={item.id}>
              <span aria-hidden="true" />
              <div>
                <h3>{item.title}</h3>
                {item.meta && <p>{item.meta}</p>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="panel-empty">No recent activity.</p>
      )}
    </Panel>
  );
}

function SkeletonRows() {
  return (
    <div className="skeleton-list">
      {Array.from({ length: 4 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
