import type { ReactNode } from "react";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(value?: string | Date | null) {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
}

export function formatCompactDate(value?: string | Date | null) {
  if (!value) {
    return "No due date";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getStatusLabel(value: string) {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getToneForStatus(value: string): Tone {
  switch (value) {
    case "active":
    case "done":
    case "member":
      return "success";
    case "planning":
    case "todo":
    case "invited":
      return "info";
    case "in_progress":
    case "review":
    case "medium":
    case "owner":
      return "accent";
    case "blocked":
    case "urgent":
    case "danger":
      return "danger";
    case "archived":
    case "inactive":
    case "low":
    case "viewer":
      return "neutral";
    case "high":
    case "warning":
      return "warning";
    default:
      return "neutral";
  }
}

export function getProgressValue(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

export function renderOrDash(value: ReactNode) {
  return value ?? "—";
}
