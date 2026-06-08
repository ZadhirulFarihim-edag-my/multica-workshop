import type { ReactNode } from "react";
import Link from "next/link";
import { PrimaryNav } from "./primary-nav";
import { StatusPill } from "../ui/status-pill";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark" aria-hidden="true">
          MC
        </div>
        <div className="brand-copy">
          <p className="brand-eyebrow">Multica Workshop</p>
          <h2 className="brand-title">Developer Command Center</h2>
          <p className="brand-description">
            A focused workspace for projects, delivery, and team operations.
          </p>
        </div>

        <PrimaryNav />

        <div className="sidebar-card">
          <StatusPill tone="success">Seeded data loaded</StatusPill>
          <p>
            The app is wired to the existing Prisma-backed workspace data and API
            routes.
          </p>
        </div>
      </aside>

      <div className="shell-body">
        <header className="shell-header">
          <div>
            <p className="shell-kicker">Operations surface</p>
            <p className="shell-title">
              <Link href="/">Command center</Link>
            </p>
          </div>
          <div className="shell-status">
            <StatusPill tone="info">Live workspace</StatusPill>
            <span className="shell-status-note">Next.js App Router</span>
          </div>
        </header>

        <main className="shell-main">{children}</main>
      </div>
    </div>
  );
}
