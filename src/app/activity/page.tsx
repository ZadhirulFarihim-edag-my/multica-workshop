import Link from "next/link";
import { headers } from "next/headers";
import { PageHeader } from "../../components/ui/page-header";
import { StatusPill } from "../../components/ui/status-pill";
import { fetchActivityLogPage } from "../../features/activity/activity-api";
import { getQueryValue, mergeSearchParams, parsePage, parseString } from "../../lib/query-params";
import { formatDateTime, getStatusLabel, getToneForStatus } from "../../lib/workspace";
import { listProjectSummaries } from "../../server/services/project.service";
import { listTeamMemberSummaries } from "../../server/services/team-member.service";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
};

async function getBaseUrl() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    throw new Error("Unable to resolve request host");
  }

  const protocol = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export default async function ActivityPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const page = parsePage(params.page, 1);
  const action = parseString(params.action);
  const projectId = parseString(params.projectId);
  const taskId = parseString(params.taskId);
  const actorId = parseString(params.actorId);

  const baseUrl = await getBaseUrl();
  const [activityPage, projectOptions, memberOptions] = await Promise.all([
    fetchActivityLogPage({
      baseUrl,
      page,
      pageSize: 12,
      action,
      projectId,
      taskId,
      actorId,
    }),
    listProjectSummaries({ page: 1, pageSize: 100 }),
    listTeamMemberSummaries({ page: 1, pageSize: 100 }),
  ]);

  const activeFilterCount = [action, projectId, taskId, actorId].filter(Boolean).length;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Activity"
        title="Workspace activity"
        description="Inspect the event stream behind projects and tasks, then drill into one project, one actor, or one task without leaving the GUI."
        actions={
          activeFilterCount > 0 ? (
            <Link className="button button-secondary button-link" href="/activity">
              Clear filters
            </Link>
          ) : undefined
        }
      />

      <form className="filters" method="get">
        <label className="field">
          <span className="field-label">Action</span>
          <input className="input" name="action" defaultValue={action} placeholder="e.g. created_task" />
        </label>

        <label className="field">
          <span className="field-label">Project</span>
          <select className="select" name="projectId" defaultValue={getQueryValue(params.projectId) ?? ""}>
            <option value="">All projects</option>
            {projectOptions.items.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Actor</span>
          <select className="select" name="actorId" defaultValue={getQueryValue(params.actorId) ?? ""}>
            <option value="">All actors</option>
            {memberOptions.items.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        {taskId ? <input type="hidden" name="taskId" value={taskId} /> : null}
        <input type="hidden" name="page" value="1" />

        <button className="button button-primary" type="submit">
          Filter
        </button>
      </form>

      {taskId ? (
        <div className="panel">
          <div className="section-card-header">
            <div>
              <p className="section-title">Task filter active</p>
              <p className="section-description">
                Showing activity tied to task <code>{taskId}</code>.
              </p>
            </div>
            <Link
              className="button button-secondary button-link"
              href={mergeSearchParams(params, { taskId: undefined, page: 1 })}
            >
              Clear task filter
            </Link>
          </div>
        </div>
      ) : null}

      <section className="section-card" aria-label="Activity results">
        <div className="section-card-header">
          <div>
            <p className="section-title">Recent events</p>
            <p className="section-description">
              {activityPage.pageInfo.totalItems} matching events across the workspace.
            </p>
          </div>
          <StatusPill tone="info">{activityPage.items.length} visible</StatusPill>
        </div>

        {activityPage.items.length > 0 ? (
          <ul className="timeline-list">
            {activityPage.items.map((entry) => (
              <li className="timeline-item" key={entry.id}>
                <div className="timeline-top">
                  <p className="timeline-strong">{entry.summary}</p>
                  <StatusPill subtle tone={getToneForStatus(entry.project.status)}>
                    {getStatusLabel(entry.action)}
                  </StatusPill>
                </div>

                <div className="list-meta">
                  <Link className="list-title" href={`/projects/${entry.project.id}`}>
                    {entry.project.name}
                  </Link>
                  <StatusPill subtle tone={getToneForStatus(entry.project.status)}>
                    {getStatusLabel(entry.project.status)}
                  </StatusPill>
                </div>

                <p className="timeline-body">
                  {entry.task ? (
                    <>
                      Task{" "}
                      <Link className="list-title" href={`/tasks/${entry.task.id}`}>
                        {entry.task.title}
                      </Link>
                      {" | "}
                      <Link
                        className="list-title"
                        href={mergeSearchParams(params, { taskId: entry.task.id, page: 1 })}
                      >
                        Focus task history
                      </Link>
                    </>
                  ) : (
                    "Project-scoped event"
                  )}
                </p>

                <p className="timeline-body">
                  {entry.actor ? (
                    <>
                      {entry.actor.name}
                      {" | "}
                      {getStatusLabel(entry.actor.role)}
                    </>
                  ) : (
                    "System event"
                  )}
                </p>

                <p className="timeline-body">{formatDateTime(entry.createdAt)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <h2 className="empty-title">No activity found</h2>
            <p className="empty-copy">
              Adjust or clear a filter to inspect a broader slice of workspace history.
            </p>
          </div>
        )}
      </section>

      <div className="panel">
        <div className="section-card-header">
          <div>
            <p className="section-title">Pagination</p>
            <p className="section-description">
              Page {activityPage.pageInfo.page} of {activityPage.pageInfo.totalPages || 1}
            </p>
          </div>
          <div className="page-header-actions">
            <Link
              aria-disabled={!activityPage.pageInfo.hasPreviousPage}
              className={`button button-secondary button-link${!activityPage.pageInfo.hasPreviousPage ? " button-disabled" : ""}`}
              href={activityPage.pageInfo.hasPreviousPage ? mergeSearchParams(params, { page: activityPage.pageInfo.page - 1 }) : "#"}
              tabIndex={!activityPage.pageInfo.hasPreviousPage ? -1 : undefined}
            >
              Previous
            </Link>
            <Link
              aria-disabled={!activityPage.pageInfo.hasNextPage}
              className={`button button-primary button-link${!activityPage.pageInfo.hasNextPage ? " button-disabled" : ""}`}
              href={activityPage.pageInfo.hasNextPage ? mergeSearchParams(params, { page: activityPage.pageInfo.page + 1 }) : "#"}
              tabIndex={!activityPage.pageInfo.hasNextPage ? -1 : undefined}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
