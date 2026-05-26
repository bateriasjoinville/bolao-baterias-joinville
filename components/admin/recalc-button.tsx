"use client";

import { useState } from "react";

import { recalcularTudo } from "@/app/admin/placares/actions";

type Status = "idle" | "running" | "done" | "error";

export function RecalcButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string | null>(null);

  const handleClick = async () => {
    setStatus("running");
    setMsg(null);
    const result = await recalcularTudo();
    if (result.ok) {
      const { participantsUpdated, weeklyEntriesUpdated, finalizedMatches } =
        result.recalculated;
      setStatus("done");
      setMsg(
        `${participantsUpdated} participantes · ${weeklyEntriesUpdated} rows semanais · ${finalizedMatches} jogos finalizados`,
      );
      setTimeout(() => setStatus("idle"), 4000);
    } else {
      setStatus("error");
      setMsg(result.error);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "running"}
        className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 disabled:opacity-60"
      >
        {status === "running" ? "Recalculando..." : "Recalcular tudo"}
      </button>
      {msg ? (
        <p
          className={`text-[10px] font-medium ${
            status === "error" ? "text-red-200" : "text-white/80"
          }`}
        >
          {msg}
        </p>
      ) : null}
    </div>
  );
}
