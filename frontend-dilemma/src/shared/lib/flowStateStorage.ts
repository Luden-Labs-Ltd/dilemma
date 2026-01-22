const STORAGE_KEY = "dilemma-flow-state";

export interface FlowState {
  currentDilemma: string | null;
  choice: "a" | "b" | null;
  reasonText: string | null;
  skipped: boolean;
}

export function loadFlowState(): FlowState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FlowState;
    if (
      typeof parsed.currentDilemma !== "string" &&
      parsed.currentDilemma !== null
    ) {
      return null;
    }
    if (
      parsed.choice != null &&
      parsed.choice !== "a" &&
      parsed.choice !== "b"
    ) {
      return null;
    }
    return {
      currentDilemma: parsed.currentDilemma ?? null,
      choice: parsed.choice ?? null,
      reasonText:
        typeof parsed.reasonText === "string" || parsed.reasonText === null
          ? parsed.reasonText
          : null,
      skipped: Boolean(parsed.skipped),
    };
  } catch {
    return null;
  }
}

export function saveFlowState(state: FlowState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function clearFlowState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
