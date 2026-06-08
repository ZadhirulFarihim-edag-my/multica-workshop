import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../../components/ui/page-header";
import { StatusPill } from "../../../components/ui/status-pill";
import {
  formatDate,
  formatDateTime,
  getStatusLabel,
  getToneForStatus,
} from "../../../lib/workspace";
import {
  getTaskDetail,
  listActivityLogSummaries,
  listCommentSummaries,
} from "../../../lib/demo-workspace";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

function isNotFoundError(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 404;
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await Promise.resolve(params);

  const result = await Promise.allSettled([
    getTaskDetail(id),
    listCommentSummaries({ page: 1, pageSize: 100, taskId: id }),
    listActivityLogSummaries({ page: 1, pageSize: 8, taskId: id }),
  ]);

  if (result[0].status === "rejected") {
    if (isNotFoundError(result[0].reason)) {
      notFound();
    }

    throw result[0].reason;
  }

  const task = result[0].value;
  const commentsPage = result[1].status === "fulfilled" ? result[1].value : { items: [], pageInfo: { page: 1, pageSize: 100, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
  const logsPage = result[2].status === "fulfilled" ? result[2].value : { items: [], pageInfo: { page: 1, pageSize: 8, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Task detail"
        title={task.title}
        description={task.description ?? "This task does not yet have a description."}
        actions={
          <Link className="button button-secondary button-link" href="/tasks">
            Back to tasks
          </Link>
        }
      />

      <section className="detail-hero">
        <div className="detail-hero-top">
          <div>
            <StatusPill tone={getToneForStatus(task.status)}>
              {getStatusLabel(task.status)}
            </StatusPill>
            <h2 className="detail-title">{task.title}</h2>
            <p className="detail-subtitle">
              Belongs to <strong>{task.project.name}</strong>.{" "}
              {task.assignee ? (
                <>
                  It is assigned to <strong>{task.assignee.name}</strong>.
                </>
              ) : (
                "It is currently unassigned."
              )}
            </p>
          </div>
          <div className="detail-meta">
            <StatusPill tone={getToneForStatus(task.priority)}>
              {getStatusLabel(task.priority)}
            </StatusPill>
            <StatusPill tone="neutral">
              Due {task.dueDate ? formatDate(task.dueDate) : "none"}
            </StatusPill>
          </div>
        </div>

        <div className="detail-meta">
          <span className="list-secondary">Created {formatDate(task.createdAt)}</span>
          <span className="list-secondary">Updated {formatDate(task.updatedAt)}</span>
          <span className="list-secondary">Comments {commentsPage.items.length}</span>
        </div>
      </section>

      <section className="split-grid">
        <div className="stack">
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <p className="section-title">Comment thread</p>
                <p className="section-description">
                  Current discussion attached to this task.
                </p>
              </div>
              <StatusPill tone="info">{commentsPage.items.length} comments</StatusPill>
            </div>

            <ul className="timeline-list">
              {commentsPage.items.map((comment) => (
                <li className="timeline-item" key={comment.id}>
                  <div className="timeline-top">
                    <p className="timeline-strong">
                      {comment.author ? comment.author.name : "System note"}
                    </p>
                    <StatusPill subtle tone="neutral">
                      {comment._count.replies} replies
                    </StatusPill>
                  </div>
                  <p className="timeline-body">{comment.content}</p>
                  <p className="timeline-body">{formatDateTime(comment.createdAt)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <div>
                <p className="section-title">Recent activity</p>
                <p className="section-description">
                  System and user events connected to this task.
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
                    {entry.project.name}
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
                <p className="section-title">Task metadata</p>
                <p className="section-description">
                  The fields that define how the task is tracked.
                </p>
              </div>
            </div>

            <div className="compact-list">
              <div className="compact-item">
                <span className="list-secondary">Project</span>
                <span className="list-title">{task.project.name}</span>
              </div>
              <div className="compact-item">
                <span className="list-secondary">Assignee</span>
                <span className="list-title">{task.assignee ? task.assignee.name : "Unassigned"}</span>
              </div>
              <div className="compact-item">
                <span className="list-secondary">Priority</span>
                <span className="list-title">{getStatusLabel(task.priority)}</span>
              </div>
              <div className="compact-item">
                <span className="list-secondary">Due date</span>
                <span className="list-title">{task.dueDate ? formatDate(task.dueDate) : "No due date"}</span>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <div>
                <p className="section-title">Workspace links</p>
                <p className="section-description">
                  Continue the review in related views.
                </p>
              </div>
            </div>

            <div className="compact-list">
              <Link className="button button-primary button-link" href={`/projects/${task.projectId}`}>
                Open project
              </Link>
              <Link className="button button-secondary button-link" href="/team">
                Review team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
