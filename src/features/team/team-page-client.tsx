"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./team-page.module.css";
import { DEFAULT_PAGE_SIZE, loadTeamMembers } from "./team-api";
import type { TeamMember, TeamMemberListData, TeamMemberStatus } from "./types";

const numberFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function getStatusClassName(status: TeamMemberStatus) {
  if (status === "active") {
    return styles.chipActive;
  }

  if (status === "inactive") {
    return styles.chipInactive;
  }

  return styles.chipInvited;
}

function getStatusLabel(status: TeamMemberStatus) {
  if (status === "active") {
    return "Active";
  }

  if (status === "inactive") {
    return "Inactive";
  }

  return "Invited";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function formatDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return dateFormatter.format(parsed);
}

function createStatusSummary(items: TeamMember[]) {
  return items.reduce(
    (summary, member) => {
      summary.totalAssigned += member.assignedTaskCount;
      summary.byStatus[member.status] += 1;
      summary.maxAssigned = Math.max(summary.maxAssigned, member.assignedTaskCount);

      if (!summary.lightest || member.assignedTaskCount < summary.lightest.assignedTaskCount) {
        summary.lightest = member;
      }

      if (!summary.heaviest || member.assignedTaskCount > summary.heaviest.assignedTaskCount) {
        summary.heaviest = member;
      }

      return summary;
    },
    {
      totalAssigned: 0,
      maxAssigned: 0,
      lightest: null as TeamMember | null,
      heaviest: null as TeamMember | null,
      byStatus: {
        active: 0,
        inactive: 0,
        invited: 0,
      },
    },
  );
}

export function TeamMembersPageClient() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<TeamMemberListData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const hasData = data !== null;

    setError(null);
    if (hasData) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    loadTeamMembers(page, controller.signal, DEFAULT_PAGE_SIZE)
      .then((nextData) => {
        if (!controller.signal.aborted) {
          setData(nextData);
        }
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load team members");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [page]);

  const pageData = data;
  const summary = useMemo(() => {
    if (!pageData) {
      return null;
    }

    return createStatusSummary(pageData.items);
  }, [pageData]);

  const totalVisible = pageData?.items.length ?? 0;
  const totalItems = pageData?.pageInfo.totalItems ?? 0;
  const totalPages = pageData?.pageInfo.totalPages ?? 0;
  const currentPage = pageData?.pageInfo.page ?? page;
  const canGoPrevious = Boolean(pageData?.pageInfo.hasPreviousPage);
  const canGoNext = Boolean(pageData?.pageInfo.hasNextPage);

  const fatalError = !pageData && error;
  const hasRows = Boolean(pageData?.items.length);
  const maxAssigned = Math.max(summary?.maxAssigned ?? 0, 1);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.eyebrowRow}>
              <p className={styles.eyebrow}>Command center</p>
              <span className={styles.endpoint}>GET /api/team-members</span>
            </div>

            <div className={styles.titleRow}>
              <div className={styles.titleBlock}>
                <h1 className={styles.title}>Team members</h1>
                <p className={styles.description}>
                  Monitor the roster, spot inactive members, and compare assigned
                  workload without leaving the command center.
                </p>
              </div>

              <div className={styles.statsGrid} aria-label="Roster summary">
                <article className={styles.statCard}>
                  <span className={styles.statLabel}>Visible members</span>
                  <span className={styles.statValue}>{numberFormatter.format(totalVisible)}</span>
                  <span className={styles.statMeta}>
                    {totalItems > 0
                      ? `${numberFormatter.format(totalItems)} total in the roster`
                      : "No team members returned yet"}
                  </span>
                </article>

                <article className={styles.statCard}>
                  <span className={styles.statLabel}>Assigned tasks</span>
                  <span className={styles.statValue}>{numberFormatter.format(summary?.totalAssigned ?? 0)}</span>
                  <span className={styles.statMeta}>
                    Current page workload across the returned members
                  </span>
                </article>

                <article className={styles.statCard}>
                  <span className={styles.statLabel}>Active state</span>
                  <span className={styles.statValue}>
                    {numberFormatter.format(summary?.byStatus.active ?? 0)}
                  </span>
                  <span className={styles.statMeta}>
                    {numberFormatter.format(summary?.byStatus.inactive ?? 0)} inactive,{" "}
                    {numberFormatter.format(summary?.byStatus.invited ?? 0)} invited
                  </span>
                </article>
              </div>
            </div>
          </div>
        </header>

        {fatalError ? (
          <section className={styles.panel}>
            <div className={styles.emptyState}>
              <div className={styles.emptyStateInner}>
                <h3>Roster failed to load</h3>
                <p>{error}</p>
                <button
                  className={styles.emptyStateButton}
                  type="button"
                  onClick={() => setPage(1)}
                >
                  Try again
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className={styles.layout}>
            <section className={`${styles.panel} ${styles.rosterPanel}`}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <h2>Roster</h2>
                  <p>
                    {pageData
                      ? `Showing ${numberFormatter.format(totalVisible)} member${
                          totalVisible === 1 ? "" : "s"
                        } on page ${numberFormatter.format(currentPage)} of ${numberFormatter.format(
                          totalPages,
                        )}`
                      : "Loading team roster"}
                  </p>
                </div>

                <div
                  className={`${styles.statePill} ${isRefreshing ? styles.statePillRefreshing : ""}`}
                >
                  <span className={styles.statusDot} />
                  {isLoading && !pageData
                    ? "Loading roster"
                    : isRefreshing
                      ? "Refreshing roster"
                      : "Data from backend"}
                </div>
              </div>

              {error && pageData ? <div className={styles.banner}>{error}</div> : null}

              {hasRows ? (
                <div className={styles.cardsGrid}>
                  {pageData!.items.map((member) => {
                    const fillPercent =
                      summary && summary.maxAssigned > 0
                        ? Math.max(6, (member.assignedTaskCount / maxAssigned) * 100)
                        : 6;

                    return (
                      <article
                        key={member.id}
                        className={`${styles.memberCard} ${
                          member.status === "inactive" ? styles.memberCardInactive : ""
                        }`}
                      >
                        <div className={styles.memberTop}>
                          <div className={styles.identity}>
                            <div className={styles.avatar} aria-hidden="true">
                              {getInitials(member.name)}
                            </div>

                            <div className={styles.identityText}>
                              <h3 className={styles.name}>{member.name}</h3>
                              <p className={styles.role}>{member.role}</p>
                            </div>
                          </div>

                          <span className={`${styles.chip} ${getStatusClassName(member.status)}`}>
                            {getStatusLabel(member.status)}
                          </span>
                        </div>

                        <div className={styles.contact}>
                          <span className={styles.fieldLabel}>Email</span>
                          <span className={styles.fieldValue}>{member.email}</span>
                        </div>

                        <div className={styles.workload}>
                          <div className={styles.workloadMeta}>
                            <span className={styles.workloadLabel}>Assigned task count</span>
                            <span className={styles.workloadValue}>
                              {numberFormatter.format(member.assignedTaskCount)}
                            </span>
                          </div>

                          <div
                            className={styles.progressTrack}
                            aria-hidden="true"
                            title={`${member.assignedTaskCount} assigned tasks`}
                          >
                            <div
                              className={styles.progressFill}
                              style={{ width: `${Math.round(fillPercent)}%` }}
                            />
                          </div>

                          <div className={styles.progressNote}>
                            Updated {formatDate(member.updatedAt)}. Workload is based on the assigned
                            task count returned by the backend.
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateInner}>
                    <h3>No team members found</h3>
                    <p>
                      The backend returned an empty roster for this page. Add team data or
                      adjust the page query to display members here.
                    </p>
                    <button
                      className={styles.emptyStateButton}
                      type="button"
                      onClick={() => setPage(1)}
                    >
                      Reload page 1
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.footerBar}>
                <div className={styles.pageStatus}>
                  Page {numberFormatter.format(currentPage)} of {numberFormatter.format(totalPages)}{" "}
                  · {numberFormatter.format(totalItems)} total team members
                </div>

                <div className={styles.pagination}>
                  <button
                    className={canGoPrevious ? styles.paginationButton : styles.paginationButtonDisabled}
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={!canGoPrevious}
                  >
                    Previous
                  </button>
                  <button
                    className={canGoNext ? styles.paginationButton : styles.paginationButtonDisabled}
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={!canGoNext}
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>

            <aside className={`${styles.panel} ${styles.sidebar}`} aria-label="Roster insight panel">
              <div className={styles.sidebarBlock}>
                <h2 className={styles.sidebarTitle}>Workload snapshot</h2>
                <p className={styles.sidebarCopy}>
                  The frontend stays within the API contract: name, role, email, active status,
                  and assigned task count. No capacity or utilization field is exposed, so workload
                  is shown as the raw task count only.
                </p>
              </div>

              <div className={styles.sidebarBlock}>
                <h3 className={styles.sidebarTitle}>Current page summary</h3>
                <ul className={styles.sidebarList}>
                  <li className={styles.sidebarListItem}>
                    <span className={styles.sidebarListLabel}>Most assigned</span>
                    <span>
                      {summary?.heaviest
                        ? `${summary.heaviest.name} (${summary.heaviest.assignedTaskCount})`
                        : "n/a"}
                    </span>
                  </li>
                  <li className={styles.sidebarListItem}>
                    <span className={styles.sidebarListLabel}>Least assigned</span>
                    <span>
                      {summary?.lightest
                        ? `${summary.lightest.name} (${summary.lightest.assignedTaskCount})`
                        : "n/a"}
                    </span>
                  </li>
                  <li className={styles.sidebarListItem}>
                    <span className={styles.sidebarListLabel}>Page max</span>
                    <span>{numberFormatter.format(summary?.maxAssigned ?? 0)} tasks</span>
                  </li>
                </ul>
              </div>

              <div className={styles.sidebarBlock}>
                <h3 className={styles.sidebarTitle}>Field mapping</h3>
                <p className={styles.sidebarCopy}>
                  This page renders the backend&apos;s returned role string directly. That avoids
                  guessing against the current API and keeps the UI aligned with the contract.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
