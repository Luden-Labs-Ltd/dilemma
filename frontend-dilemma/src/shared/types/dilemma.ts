// Типы для дилемм и ответов пользователей
export type DilemmaType = "professional" | "state" | "medical";

export type Choice = "a" | "b";

export interface DilemmaOption {
  id: Choice;
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
  options: [DilemmaOption, DilemmaOption];
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
