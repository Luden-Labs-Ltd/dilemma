// Типы для дилемм и ответов пользователей (spec 006: 2–10 options)
export type DilemmaType = string;

/** Option letter A–J (uppercase for API). */
export type Choice = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";

/** id опции для отображения; для API третья опция (c) маппится в "b" */
export type OptionId = "a" | "b" | "c";

export interface DilemmaOption {
  id: OptionId;
  label: string;
  image?: string;
}

export interface Source {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

export interface Dilemma {
  id: DilemmaType;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  questionText: string;
  options: DilemmaOption[];
  sources: Source[];
  reflectionText: string;
}

// Ответ пользователя (сохраняется в localStorage / backend)
export interface UserAnswer {
  dilemmaId: DilemmaType;
  choice: Choice;
  reasonText: string | null;
  skipped: boolean;
  timestamp: number;
}

// Статистика по дилемме (pathCounts: trajectory -> count; для 2 и 3+ опций)
export interface DilemmaStats {
  dilemmaId: DilemmaType;
  total: number;
  pathCounts: Record<string, number>;
  /** Количество решений с финальным выбором по букве (A, B, C, …) */
  optionCounts: Record<string, number>;
  /** Доля в % по букве (A, B, C, …) */
  optionPercents: Record<string, number>;
  aCount?: number;
  bCount?: number;
  aPercent?: number;
  bPercent?: number;
  cCount?: number;
  cPercent?: number;
}
