"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { readApiEnvelope } from "../../features/api/api-client";

type DeleteResourceButtonProps = {
  endpoint: string;
  redirectTo: string;
  label: string;
  confirmMessage: string;
};

export function DeleteResourceButton({
  endpoint,
  redirectTo,
  label,
  confirmMessage,
}: DeleteResourceButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      await readApiEnvelope<{ item: { id: string } }>(response);

      startTransition(() => {
        router.push(redirectTo);
        router.refresh();
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Delete failed");
    }
  }

  return (
    <div className="form-inline">
      <button className="button button-danger" disabled={isPending} onClick={handleDelete} type="button">
        {isPending ? "Deleting..." : label}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
