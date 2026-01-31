import type { Choice } from "@/shared/types";

const STORAGE_KEY = "dilemma-flow-state";

export interface FlowState {
  currentDilemma: string | null;
  choice: Choice | null;
  reasonText: string | null;
  skipped: boolean;
}

const VALID_CHOICES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

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
      !VALID_CHOICES.includes(parsed.choice as (typeof VALID_CHOICES)[number])
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
