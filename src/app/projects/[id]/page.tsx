import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../../components/ui/page-header";
import { StatusPill } from "../../../components/ui/status-pill";
import { formatDate, formatDateTime, getStatusLabel, getToneForStatus } from "../../../lib/workspace";
import {
  getProjectDetail,
  listActivityLogSummaries,
  listTaskSummaries,
} from "../../../lib/demo-workspace";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

function isNotFoundError(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 404;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await Promise.resolve(params);

  const projectResult = await Promise.allSettled([
    getProjectDetail(id),
    listTaskSummaries({ page: 1, pageSize: 100, projectId: id }),
    listActivityLogSummaries({ page: 1, pageSize: 8, projectId: id }),
  ]);

  if (projectResult[0].status === "rejected") {
    if (isNotFoundError(projectResult[0].reason)) {
      notFound();
    }

    throw projectResult[0].reason;
  }

  const project = projectResult[0].value;
  const taskPage = projectResult[1].status === "fulfilled" ? projectResult[1].value : { items: [], pageInfo: { page: 1, pageSize: 100, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
  const logsPage = projectResult[2].status === "fulfilled" ? projectResult[2].value : { items: [], pageInfo: { page: 1, pageSize: 8, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };

  const completedTasks = taskPage.items.filter((task) => task.status === "done").length;
  const progress = taskPage.items.length > 0 ? Math.round((completedTasks / taskPage.items.length) * 100) : 0;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Project detail"
        title={project.name}
        description={project.description ?? "This project does not yet have a description."}
        actions={
          <Link className="button button-secondary button-link" href="/projects">
            Back to projects
          </Link>
        }
      />

      <section className="detail-hero">
        <div className="detail-hero-top">
          <div>
            <StatusPill tone={getToneForStatus(project.status)}>
              {getStatusLabel(project.status)}
            </StatusPill>
            <h2 className="detail-title">{project.name}</h2>
            <p className="detail-subtitle">
              Owned by <strong>{project.owner.name}</strong>. {project._count.tasks} tasks
              belong to this project and the current task completion rate is {progress}%.
            </p>
          </div>
          <div className="detail-meta">
            <StatusPill tone="info">Updated {formatDate(project.updatedAt)}</StatusPill>
            <StatusPill tone="neutral">Created {formatDate(project.createdAt)}</StatusPill>
          </div>
        </div>

        <div className="bar-track" aria-hidden="true">
          <div className="bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="split-grid">
        <div className="stack">
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <p className="section-title">Project tasks</p>
                <p className="section-description">
                  The tasks currently assigned to this project.
                </p>
              </div>
              <StatusPill tone="info">{taskPage.items.length} visible</StatusPill>
            </div>

            <ul className="compact-list">
              {taskPage.items.map((task) => (
                <li className="compact-item" key={task.id}>
                  <div className="list-meta">
                    <Link className="list-title" href={`/tasks/${task.id}`}>
                      {task.title}
                    </Link>
                    <StatusPill tone={getToneForStatus(task.priority)}>
                      {getStatusLabel(task.priority)}
                    </StatusPill>
                  </div>
                  <p className="list-secondary">
                    {task.assignee ? task.assignee.name : "Unassigned"} ·{" "}
                    {task._count.comments} comments ·{" "}
                    {task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}
                  </p>
                  <p className="list-secondary">
                    {getStatusLabel(task.status)} · {task.project.name}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <div>
                <p className="section-title">Recent activity</p>
                <p className="section-description">
                  What changed most recently for this project.
                </p>
              </div>
              <StatusPill tone="info">{logsPage.items.length} items</StatusPill>
            </div>

            <ul className="timeline-list">
              {logsPage.items.map((entry) => (
                <li className="timeline-item" key={entry.id}>
                  <div className="timeline-top">
                    <p className="timeline-strong">{entry.summary}</p>
                    <StatusPill subtle tone="neutral">
                      {getStatusLabel(entry.action)}
                    </StatusPill>
                  </div>
                  <p className="timeline-body">
                    {entry.task ? entry.task.title : "Project scoped event"}
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
                <p className="section-title">Project metadata</p>
                <p className="section-description">
                  Ownership and record details for this project.
                </p>
              </div>
            </div>

            <div className="compact-list">
              <div className="compact-item">
                <span className="list-secondary">Owner</span>
                <span className="list-title">{project.owner.name}</span>
                <span className="list-secondary">{project.owner.email}</span>
              </div>
              <div className="compact-item">
                <span className="list-secondary">Color</span>
                <span className="list-title">{project.color ?? "Default workspace palette"}</span>
              </div>
              <div className="compact-item">
                <span className="list-secondary">Created</span>
                <span className="list-title">{formatDate(project.createdAt)}</span>
              </div>
              <div className="compact-item">
                <span className="list-secondary">Updated</span>
                <span className="list-title">{formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <div>
                <p className="section-title">Workspace links</p>
                <p className="section-description">
                  Jump to related views without losing context.
                </p>
              </div>
            </div>

            <div className="compact-list">
              <Link className="button button-primary button-link" href="/tasks">
                Open tasks
              </Link>
              <Link className="button button-secondary button-link" href="/team">
                Open team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
