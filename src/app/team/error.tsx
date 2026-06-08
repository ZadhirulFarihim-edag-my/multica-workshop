"use client";

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="errorShell">
      <section className="errorCard" role="alert" aria-live="polite">
        <p className="eyebrow">Team roster unavailable</p>
        <h1>We could not load the `/team` page.</h1>
        <p className="body">
          {error.message || "Something went wrong while loading the team data."}
        </p>
        <button className="retryButton" type="button" onClick={reset}>
          Retry loading
        </button>
      </section>
      <style jsx>{`
        .errorShell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 32px;
        }

        .errorCard {
          width: min(720px, 100%);
          border-radius: 28px;
          border: 1px solid rgba(248, 113, 113, 0.22);
          background: rgba(15, 23, 42, 0.88);
          box-shadow: 0 30px 80px rgba(2, 8, 23, 0.45);
          padding: 28px;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #fca5a5;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 0.76rem;
          font-weight: 700;
        }

        h1 {
          margin: 0;
          font-size: clamp(2rem, 4vw, 2.6rem);
        }

        .body {
          margin: 12px 0 0;
          color: #cbd5e1;
          line-height: 1.6;
        }

        .retryButton {
          margin-top: 20px;
          border-radius: 999px;
          padding: 12px 18px;
          background: linear-gradient(135deg, #22d3ee, #0891b2);
          color: #020617;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}
