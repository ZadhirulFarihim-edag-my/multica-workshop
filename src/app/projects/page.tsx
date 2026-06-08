import Link from "next/link";
import { PageHeader } from "../../components/ui/page-header";
import { StatusPill } from "../../components/ui/status-pill";
import {
  formatDate,
  getStatusLabel,
  getToneForStatus,
} from "../../lib/workspace";
import {
  getQueryValue,
  mergeSearchParams,
  parsePage,
  parseString,
} from "../../lib/query-params";
import { listProjectSummaries, listTaskSummaries } from "../../lib/demo-workspace";

export const dynamic = "force-dynamic";

const projectStatuses = ["planning", "active", "archived"] as const;

type ProjectStatus = (typeof projectStatuses)[number];

function isProjectStatus(value: string | undefined): value is ProjectStatus {
  return projectStatuses.includes(value as ProjectStatus);
}

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const page = parsePage(params.page, 1);
  const search = parseString(params.search);
  const statusValue = parseString(params.status);
  const status = isProjectStatus(statusValue) ? statusValue : undefined;

  const data = await listProjectSummaries({
    page,
    pageSize: 8,
    search,
    status,
  });

  const taskSummary = await listTaskSummaries({
    page: 1,
    pageSize: 100,
    projectId: undefined,
  });

  return (
    <div className="page">
      <PageHeader
        eyebrow="Projects"
        title="Project portfolio"
        description="Review ownership, progress, and the health of every active project in one place."
      />

      <form className="filters" method="get">
        <label className="field">
          <span className="field-label">Search</span>
          <input className="input" name="search" defaultValue={search} placeholder="Search projects" />
        </label>

        <label className="field">
          <span className="field-label">Status</span>
          <select className="select" name="status" defaultValue={getQueryValue(params.status) ?? ""}>
            <option value="">All statuses</option>
            {projectStatuses.map((value) => (
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

      <section className="resource-grid" aria-label="Project results">
        {data.items.map((project) => {
          const projectTaskCount = taskSummary.items.filter((task) => task.projectId === project.id).length;

          return (
            <article className="resource-card" key={project.id}>
              <div className="resource-top">
                <div className="resource-body">
                  <div className="resource-top">
                    <Link className="resource-title" href={`/projects/${project.id}`}>
                      {project.name}
                    </Link>
                    <StatusPill tone={getToneForStatus(project.status)}>
                      {getStatusLabel(project.status)}
                    </StatusPill>
                  </div>
                  <p className="resource-description">{project.description ?? "No project description provided."}</p>
                </div>
              </div>

              <div className="compact-list">
                <div className="list-meta">
                  <span className="list-secondary">Owner</span>
                  <span className="list-title">{project.owner.name}</span>
                </div>
                <div className="list-meta">
                  <span className="list-secondary">Tasks</span>
                  <span className="list-title">{projectTaskCount}</span>
                </div>
                <div className="list-meta">
                  <span className="list-secondary">Updated</span>
                  <span className="list-title">{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {data.items.length === 0 ? (
        <div className="empty-state">
          <h2 className="empty-title">No projects found</h2>
          <p className="empty-copy">
            Try a broader search or clear the status filter to see more of the
            workspace.
          </p>
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
