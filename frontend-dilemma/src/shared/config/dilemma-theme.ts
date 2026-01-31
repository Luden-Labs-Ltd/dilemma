/**
 * Дилемы с единым «современным» стилем (рамки, фон): Rescue or Illusion?, Education or Programming?
 */
export const MODERN_THEME_DILEMMA_IDS = ["commander", "doctor", "teacher"] as const;

export type ModernThemeDilemmaId = (typeof MODERN_THEME_DILEMMA_IDS)[number];

// Фоны для Choice и Stats: у каждой дилемы свой фон; оверлей затемнения (60% или 70%)
import bgDoctor from "@/shared/assets/dilemmas/doctor/background.png?format=webp";
import bgPrivacyVsSecurity from "@/shared/assets/dilemmas/privacy-vs-security/background.png?format=webp";

const MODERN_THEME_BACKGROUNDS: Record<ModernThemeDilemmaId, string> = {
  // "commander": bgAiAutonomy,
  "doctor": bgDoctor,
  "teacher": bgPrivacyVsSecurity,
};

/** Оверлей затемнения фона: 0.6 = 60%, 0.7 = 70% */
const MODERN_THEME_OVERLAY_OPACITY: Record<ModernThemeDilemmaId, number> = {
  "doctor": 0.6,
  "commander": 0.7,
  "teacher": 0.6,
};

export function isModernThemeDilemma(dilemmaId: string | null): boolean {
  return dilemmaId != null && MODERN_THEME_DILEMMA_IDS.includes(dilemmaId as ModernThemeDilemmaId);
}

export function getModernThemeBackground(dilemmaId: string | null): string | null {
  if (dilemmaId == null || !isModernThemeDilemma(dilemmaId)) return null;
  return MODERN_THEME_BACKGROUNDS[dilemmaId as ModernThemeDilemmaId] ?? null;
}

export function getModernThemeOverlayOpacity(dilemmaId: string | null): number {
  if (dilemmaId == null || !isModernThemeDilemma(dilemmaId)) return 0.6;
  return MODERN_THEME_OVERLAY_OPACITY[dilemmaId as ModernThemeDilemmaId] ?? 0.6;
}
