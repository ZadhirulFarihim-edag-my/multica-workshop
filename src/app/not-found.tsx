import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <div className="empty-state">
        <h1 className="empty-title">Page not found</h1>
        <p className="empty-copy">
          The route you requested does not exist in this workspace.
        </p>
        <Link className="button button-primary button-link" href="/">
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
