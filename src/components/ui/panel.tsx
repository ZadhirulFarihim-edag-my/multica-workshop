import type { ReactNode } from "react";

type PanelProps = {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, eyebrow, children, className }: PanelProps) {
  return (
    <section className={["panel", className].filter(Boolean).join(" ")}>
      {(title || eyebrow) && (
        <header className="panel__header">
          {eyebrow && <span className="panel__eyebrow">{eyebrow}</span>}
          {title && <h2>{title}</h2>}
        </header>
      )}
      {children}
    </section>
  );
}
