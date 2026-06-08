"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <div className="empty-state">
            <h1 className="empty-title">Something went wrong</h1>
            <p className="empty-copy">
              The command center could not finish loading this view.
            </p>
            <p className="empty-copy">{error.message}</p>
            <div className="page-header-actions">
              <button className="button button-primary" type="button" onClick={reset}>
                Try again
              </button>
              <Link className="button button-secondary button-link" href="/">
                Return home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
