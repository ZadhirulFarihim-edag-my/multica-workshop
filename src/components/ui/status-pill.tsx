import type { ReactNode } from "react";
import type { Tone } from "../../lib/workspace";

type StatusPillProps = {
  children: ReactNode;
  tone?: Tone;
  subtle?: boolean;
};

export function StatusPill({
  children,
  tone = "neutral",
  subtle = false,
}: StatusPillProps) {
  return (
    <span className={`pill pill-${tone}${subtle ? " pill-subtle" : ""}`}>
      {children}
    </span>
  );
}
