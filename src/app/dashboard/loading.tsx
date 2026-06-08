export default function DashboardLoading() {
  return (
    <main className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <p className="dashboard-kicker">Developer Command Center</p>
          <h1>Dashboard Overview</h1>
        </div>
      </header>
      <div className="metric-grid" aria-label="Dashboard loading">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="metric-card metric-card--loading" key={index}>
            <span />
            <strong />
            <em />
          </div>
        ))}
      </div>
    </main>
  );
}
