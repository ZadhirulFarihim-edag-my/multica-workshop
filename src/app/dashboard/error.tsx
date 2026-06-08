"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="dashboard-shell">
      <section className="panel">
        <header className="panel__header">
          <span className="panel__eyebrow">Error</span>
          <h2>Dashboard unavailable</h2>
        </header>
        <div className="empty-state empty-state--error">
          <p>The dashboard could not be rendered.</p>
          <button type="button" onClick={reset}>
            Retry
          </button>
        </div>
      </section>
    </main>
  );
}
