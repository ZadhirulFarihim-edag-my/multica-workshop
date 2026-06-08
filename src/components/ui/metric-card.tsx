import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  detail: ReactNode;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-detail">{detail}</p>
    </article>
  );
}
