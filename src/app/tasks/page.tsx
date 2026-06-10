import Link from "next/link";
import { PageHeader } from "../../components/ui/page-header";
import { StatusPill } from "../../components/ui/status-pill";
import { getQueryValue, mergeSearchParams, parsePage, parseString } from "../../lib/query-params";
import { formatDate, getStatusLabel, getToneForStatus } from "../../lib/workspace";
import { listTaskSummaries } from "../../server/services/task.service";

export const dynamic = "force-dynamic";

const taskStatuses = ["todo", "in_progress", "review", "blocked", "done"] as const;
const priorities = ["low", "medium", "high", "urgent"] as const;

type TaskStatus = (typeof taskStatuses)[number];
type Priority = (typeof priorities)[number];

function isTaskStatus(value: string | undefined): value is TaskStatus {
  return taskStatuses.includes(value as TaskStatus);
}

function isPriority(value: string | undefined): value is Priority {
  return priorities.includes(value as Priority);
}

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
};

export default async function TasksPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const page = parsePage(params.page, 1);
  const search = parseString(params.search);
  const statusValue = parseString(params.status);
  const priorityValue = parseString(params.priority);
  const status = isTaskStatus(statusValue) ? statusValue : undefined;
  const priority = isPriority(priorityValue) ? priorityValue : undefined;

  const data = await listTaskSummaries({
    page,
    pageSize: 10,
    search,
    status,
    priority,
  });

  return (
    <div className="page">
      <PageHeader
        eyebrow="Tasks"
        title="Task board"
        description="Review task status, priority, assignee, and due date without leaving the command center."
        actions={
          <Link className="button button-primary button-link" href="/tasks/new">
            New task
          </Link>
        }
      />

      <form className="filters" method="get">
        <label className="field">
          <span className="field-label">Search</span>
          <input className="input" name="search" defaultValue={search} placeholder="Search tasks" />
        </label>

        <label className="field">
          <span className="field-label">Status</span>
          <select className="select" name="status" defaultValue={getQueryValue(params.status) ?? ""}>
            <option value="">All statuses</option>
            {taskStatuses.map((value) => (
              <option key={value} value={value}>
                {getStatusLabel(value)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Priority</span>
          <select className="select" name="priority" defaultValue={getQueryValue(params.priority) ?? ""}>
            <option value="">All priorities</option>
            {priorities.map((value) => (
              <option key={value} value={value}>
                {getStatusLabel(value)}
              </option>
            ))}
          </select>
        </label>

        <input type="hidden" name="page" value="1" />

        <button className="button button-primary" type="submit">
          Filter
        </button>
      </form>

      <section className="list-table" aria-label="Task results">
        <div className="table-row table-header" aria-hidden="true">
          <div className="table-cell">
            <span className="table-label">Task</span>
          </div>
          <div className="table-cell">
            <span className="table-label">Project</span>
          </div>
          <div className="table-cell">
            <span className="table-label">Assignee / Due</span>
          </div>
          <div className="table-cell">
            <span className="table-label">Status</span>
          </div>
        </div>

        {data.items.map((task) => (
          <article className="table-row" key={task.id}>
            <div className="table-cell">
              <Link className="list-title" href={`/tasks/${task.id}`}>
                {task.title}
              </Link>
              <p className="table-value">{task.description ?? "No task description provided."}</p>
            </div>

            <div className="table-cell">
              <span className="table-value">{task.project.name}</span>
              <StatusPill subtle tone="neutral">
                {getStatusLabel(task.project.status)}
              </StatusPill>
            </div>

            <div className="table-cell">
              <span className="table-value">{task.assignee ? task.assignee.name : "Unassigned"}</span>
              <span className="table-value">
                {task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}
              </span>
            </div>

            <div className="table-cell">
              <StatusPill tone={getToneForStatus(task.status)}>
                {getStatusLabel(task.status)}
              </StatusPill>
              <StatusPill subtle tone={getToneForStatus(task.priority)}>
                {getStatusLabel(task.priority)}
              </StatusPill>
              <span className="table-value">{task._count.comments} comments</span>
            </div>
          </article>
        ))}
      </section>

      {data.items.length === 0 ? (
        <div className="empty-state">
          <h2 className="empty-title">No tasks found</h2>
          <p className="empty-copy">Try a broader search or clear one of the task filters.</p>
        </div>
      ) : null}

      <div className="panel">
        <div className="section-card-header">
          <div>
            <p className="section-title">Pagination</p>
            <p className="section-description">
              Page {data.pageInfo.page} of {data.pageInfo.totalPages || 1}
            </p>
          </div>
          <div className="page-header-actions">
            <Link
              aria-disabled={!data.pageInfo.hasPreviousPage}
              className={`button button-secondary button-link${!data.pageInfo.hasPreviousPage ? " button-disabled" : ""}`}
              href={data.pageInfo.hasPreviousPage ? mergeSearchParams(params, { page: data.pageInfo.page - 1 }) : "#"}
              tabIndex={!data.pageInfo.hasPreviousPage ? -1 : undefined}
            >
              Previous
            </Link>
            <Link
              aria-disabled={!data.pageInfo.hasNextPage}
              className={`button button-primary button-link${!data.pageInfo.hasNextPage ? " button-disabled" : ""}`}
              href={data.pageInfo.hasNextPage ? mergeSearchParams(params, { page: data.pageInfo.page + 1 }) : "#"}
              tabIndex={!data.pageInfo.hasNextPage ? -1 : undefined}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
