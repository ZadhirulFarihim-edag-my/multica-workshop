import Link from "next/link";
import { MetricCard } from "../components/ui/metric-card";
import { PageHeader } from "../components/ui/page-header";
import { StatusPill } from "../components/ui/status-pill";
import {
  formatDateTime,
  getProgressValue,
  getStatusLabel,
  getToneForStatus,
} from "../lib/workspace";
import { getDashboardSnapshot } from "../lib/demo-workspace";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  const projectDone = snapshot.byStatus.projects.active ?? 0;
  const taskDone = snapshot.byStatus.tasks.done ?? 0;
  const teamActive = snapshot.byStatus.teamMembers.active ?? 0;

  const projectTotal = snapshot.summary.projects;
  const taskTotal = snapshot.summary.tasks;
  const teamTotal = snapshot.summary.teamMembers;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Overview"
        title="Command center"
        description="Track project health, delivery flow, team capacity, and the latest operational activity from one place."
      />

      <section className="metric-grid" aria-label="Workspace summary">
        <MetricCard
          detail="Projects currently tracked in the workspace."
          label="Projects"
          value={snapshot.summary.projects}
        />
        <MetricCard
          detail="Tasks across every project and status."
          label="Tasks"
          value={snapshot.summary.tasks}
        />
        <MetricCard
          detail="Active, invited, and inactive team members."
          label="Team members"
          value={snapshot.summary.teamMembers}
        />
        <MetricCard
          detail="Comments left on tasks across the workspace."
          label="Comments"
          value={snapshot.summary.comments}
        />
        <MetricCard
          detail="Recent activity log entries captured in the system."
          label="Activity logs"
          value={snapshot.summary.activityLogs}
        />
        <MetricCard
          detail="Items that are overdue but not yet marked done."
          label="Overdue tasks"
          value={snapshot.summary.overdueTasks}
        />
      </section>

      <section className="dashboard-grid">
        <div className="stack">
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <p className="section-title">Status distribution</p>
                <p className="section-description">
                  The strongest signal for where the team is spending time right now.
                </p>
              </div>
            </div>

            <div className="status-columns">
              {[
                {
                  title: "Projects",
                  total: projectTotal,
                  rows: snapshot.byStatus.projects,
                },
                {
                  title: "Tasks",
                  total: taskTotal,
                  rows: snapshot.byStatus.tasks,
                },
                {
                  title: "Team",
                  total: teamTotal,
                  rows: snapshot.byStatus.teamMembers,
                },
              ].map((section) => {
                const entries = Object.entries(section.rows).sort((left, right) => {
                  return right[1] - left[1];
                });

                return (
                  <article className="status-card" key={section.title}>
                    <h3 className="status-card-title">{section.title}</h3>
                    <div className="status-list">
                      {entries.map(([status, count]) => {
                        const progress = getProgressValue(count, section.total);
                        const tone = getToneForStatus(status);

                        return (
                          <div className="status-row" key={status}>
                            <div className="status-row-top">
                              <span className="status-row-label">{getStatusLabel(status)}</span>
                              <StatusPill subtle tone={tone}>
                                {count}
                              </StatusPill>
                            </div>
                            <div className="bar-track" aria-hidden="true">
                              <div
                                className={`bar-fill${tone === "accent" ? " bar-fill-accent" : ""}${tone === "danger" ? " bar-fill-danger" : ""}${tone === "neutral" ? " bar-fill-muted" : ""}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <div>
                <p className="section-title">Recent activity</p>
                <p className="section-description">
                  The latest events from across projects and tasks.
                </p>
              </div>
              <StatusPill tone="info">{snapshot.recentActivity.length} items</StatusPill>
            </div>

            <ul className="timeline-list">
              {snapshot.recentActivity.map((entry) => (
                <li className="timeline-item" key={entry.id}>
                  <div className="timeline-top">
                    <p className="timeline-strong">{entry.summary}</p>
                    <StatusPill subtle tone="neutral">
                      {getStatusLabel(entry.action)}
                    </StatusPill>
                  </div>
                  <p className="timeline-body">
                    {entry.project.name}
                    {entry.task ? ` · ${entry.task.title}` : ""}
                    {entry.actor ? ` · ${entry.actor.name}` : ""}
                  </p>
                  <p className="timeline-body">{formatDateTime(entry.createdAt)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="detail-stack">
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <p className="section-title">Upcoming work</p>
                <p className="section-description">
                  Priority items with the nearest due dates.
                </p>
              </div>
            </div>

            <ul className="compact-list">
              {snapshot.upcomingTasks.map((task) => (
                <li className="compact-item" key={task.id}>
                  <div className="list-meta">
                    <span className="list-title">{task.title}</span>
                    <StatusPill tone={getToneForStatus(task.priority)}>
                      {getStatusLabel(task.priority)}
                    </StatusPill>
                  </div>
                  <p className="list-secondary">
                    {task.project.name}
                    {task.assignee ? ` · ${task.assignee.name}` : " · Unassigned"}
                  </p>
                  <div className="list-meta">
                    <span className="list-secondary">{task.status}</span>
                    <span className="list-secondary">
                      Due {task.dueDate ? formatDateTime(task.dueDate) : "soon"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <div>
                <p className="section-title">Workspace pulse</p>
                <p className="section-description">
                  Quick read on team and delivery health.
                </p>
              </div>
            </div>

            <div className="compact-list">
              <div className="compact-item">
                <div className="list-meta">
                  <span className="list-title">Completion signal</span>
                  <StatusPill tone="success">{projectDone} active projects</StatusPill>
                </div>
                <p className="list-secondary">
                  {taskDone} tasks are marked done, which keeps the system from
                  stacking up unresolved work.
                </p>
              </div>

              <div className="compact-item">
                <div className="list-meta">
                  <span className="list-title">Capacity signal</span>
                  <StatusPill tone="info">{teamActive} active people</StatusPill>
                </div>
                <p className="list-secondary">
                  {snapshot.summary.overdueTasks} overdue tasks need attention before
                  they grow into blockers.
                </p>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <div>
                <p className="section-title">Shortcuts</p>
                <p className="section-description">
                  Jump straight into the core views.
                </p>
              </div>
            </div>

            <div className="compact-list">
              <Link className="button button-primary button-link" href="/projects">
                Open projects
              </Link>
              <Link className="button button-secondary button-link" href="/tasks">
                Review tasks
              </Link>
              <Link className="button button-secondary button-link" href="/team">
                Check team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
