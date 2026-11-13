"use client";

import { useActionState, useState, useTransition } from "react";

import { approveAction, rejectAction, withdrawAction, type ActionState } from "@/app/requests/actions";
import { FormMessage, inputClass } from "@/components/form-field";

/** Teacher: approve, or reject with an optional note. Errors (e.g. 409 conflict) are shown inline. */
export function RequestDecision({ id }: { id: number }) {
  const [approveState, approve, approving] = useActionState<ActionState, FormData>(approveAction.bind(null, id), {});
  const [rejectState, reject, rejecting] = useActionState<ActionState, FormData>(rejectAction.bind(null, id), {});
  const [rejectOpen, setRejectOpen] = useState(false);
  const busy = approving || rejecting;

  return (
    <div className="flex flex-col gap-2">
      <FormMessage message={approveState.message ?? rejectState.message} />
      <div className="flex flex-wrap items-start gap-3">
        <form action={approve}>
          <button type="submit" disabled={busy} className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50">
            {approving ? "Approving..." : "Approve"}
          </button>
        </form>
        {rejectOpen ? (
          <form action={reject} className="flex flex-1 flex-wrap items-start gap-2">
            <input name="note" maxLength={500} placeholder="Note for the student (optional)" aria-label="Rejection note" className={`${inputClass} min-w-56 flex-1`} />
            <button type="submit" disabled={busy} className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">
              {rejecting ? "Rejecting..." : "Confirm reject"}
            </button>
            <button type="button" onClick={() => setRejectOpen(false)} className="px-2 py-1.5 text-sm text-zinc-500 hover:underline">
              Back
            </button>
          </form>
        ) : (
          <button type="button" disabled={busy} onClick={() => setRejectOpen(true)} className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950">
            Reject
          </button>
        )}
      </div>
    </div>
  );
}

/** Student: withdraw a pending request after confirmation. */
export function WithdrawButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Withdraw this request? The lesson keeps its current time.")) return;
          startTransition(async () => setMessage((await withdrawAction(id)).message));
        }}
        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Withdrawing..." : "Withdraw"}
      </button>
      {message && <span className="text-xs text-red-600">{message}</span>}
    </div>
  );
}
