// Типы для дилемм и ответов пользователей
export type DilemmaType = string;

export type Choice = "a" | "b";

/** id опции для отображения; для API третья опция (c) маппится в "b" */
export type OptionId = "a" | "b" | "c";

export interface DilemmaOption {
  id: OptionId;
  label: string;
  image: string;
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

// Статистика по дилемме
export interface DilemmaStats {
  dilemmaId: DilemmaType;
  total: number;
  aCount: number;
  bCount: number;
  aPercent: number;
  bPercent: number;
}
