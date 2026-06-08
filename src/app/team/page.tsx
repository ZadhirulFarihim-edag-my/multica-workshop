import Link from "next/link";
import { PageHeader } from "../../components/ui/page-header";
import { StatusPill } from "../../components/ui/status-pill";
import { formatDate, getStatusLabel, getToneForStatus } from "../../lib/workspace";
import { getQueryValue, mergeSearchParams, parsePage, parseString } from "../../lib/query-params";
import { listTeamMemberSummaries } from "../../lib/demo-workspace";

export const dynamic = "force-dynamic";

const memberStatuses = ["active", "inactive", "invited"] as const;
const roles = ["owner", "admin", "member", "viewer"] as const;

type MemberStatus = (typeof memberStatuses)[number];
type MemberRole = (typeof roles)[number];

function isMemberStatus(value: string | undefined): value is MemberStatus {
  return memberStatuses.includes(value as MemberStatus);
}

function isMemberRole(value: string | undefined): value is MemberRole {
  return roles.includes(value as MemberRole);
}

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
};

export default async function TeamPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const page = parsePage(params.page, 1);
  const search = parseString(params.search);
  const statusValue = parseString(params.status);
  const roleValue = parseString(params.role);
  const status = isMemberStatus(statusValue) ? statusValue : undefined;
  const role = isMemberRole(roleValue) ? roleValue : undefined;

  const data = await listTeamMemberSummaries({
    page,
    pageSize: 12,
    search,
    status,
    role,
  });

  const counts = data.items.reduce<Record<string, number>>((accumulator, member) => {
    accumulator[member.status] = (accumulator[member.status] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <div className="page">
      <PageHeader
        eyebrow="Team"
        title="Team capacity"
        description="See who is active, which roles are represented, and how much delivery work is assigned across the team."
      />

      <form className="filters" method="get">
        <label className="field">
          <span className="field-label">Search</span>
          <input className="input" name="search" defaultValue={search} placeholder="Search people" />
        </label>

        <label className="field">
          <span className="field-label">Status</span>
          <select className="select" name="status" defaultValue={getQueryValue(params.status) ?? ""}>
            <option value="">All statuses</option>
            {memberStatuses.map((value) => (
              <option key={value} value={value}>
                {getStatusLabel(value)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Role</span>
          <select className="select" name="role" defaultValue={getQueryValue(params.role) ?? ""}>
            <option value="">All roles</option>
            {roles.map((value) => (
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

      <section className="metric-grid" aria-label="Team summary">
        <article className="metric-card">
          <p className="metric-label">Active</p>
          <p className="metric-value">{counts.active ?? 0}</p>
          <p className="metric-detail">People currently available for delivery work.</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Invited</p>
          <p className="metric-value">{counts.invited ?? 0}</p>
          <p className="metric-detail">New members that still need to accept access.</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Inactive</p>
          <p className="metric-value">{counts.inactive ?? 0}</p>
          <p className="metric-detail">Archived or paused accounts in the workspace.</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Visible members</p>
          <p className="metric-value">{data.items.length}</p>
          <p className="metric-detail">Results from the current page of the directory.</p>
        </article>
      </section>

      <section className="resource-grid" aria-label="Team results">
        {data.items.map((member) => (
          <article className="resource-card" key={member.id}>
            <div className="resource-top">
              <div className="resource-body">
                <div className="resource-top">
                  <span className="resource-title">{member.name}</span>
                  <StatusPill tone={getToneForStatus(member.status)}>
                    {getStatusLabel(member.status)}
                  </StatusPill>
                </div>
                <p className="resource-description">{member.email}</p>
              </div>
            </div>

            <div className="compact-list">
              <div className="list-meta">
                <span className="list-secondary">Role</span>
                <span className="list-title">{getStatusLabel(member.role)}</span>
              </div>
              <div className="list-meta">
                <span className="list-secondary">Assigned tasks</span>
                <span className="list-title">{member.assignedTaskCount}</span>
              </div>
              <div className="list-meta">
                <span className="list-secondary">Updated</span>
                <span className="list-title">{formatDate(member.updatedAt)}</span>
              </div>
              <div className="resource-meta">{member.notes ?? "No notes on this member yet."}</div>
            </div>
          </article>
        ))}
      </section>

      {data.items.length === 0 ? (
        <div className="empty-state">
          <h2 className="empty-title">No team members found</h2>
          <p className="empty-copy">
            Try removing a filter or using a broader search term.
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
