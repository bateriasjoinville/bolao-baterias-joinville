export type PalpiteSaveResult = { ok: true } | { ok: false; error: string };

export type PalpiteStatus = "idle" | "saving" | "saved" | "error";

export type PalpiteState = {
  placarA: number | null;
  placarB: number | null;
  status: PalpiteStatus;
  errorMsg?: string;
};
