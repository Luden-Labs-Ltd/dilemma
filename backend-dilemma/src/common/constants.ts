/**
 * Multi-option dilemmas: max options per dilemma (spec 006).
 */
export const MAX_OPTIONS = 10;

/** Option letters A–J for API and path (trajectory) strings. */
export const OPTION_LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
] as const;

export type OptionLetter = (typeof OPTION_LETTERS)[number];

/**
 * Returns option letters A..J for the given count (2–10).
 * Used to validate choice against dilemma.options_count.
 */
export function getValidOptionLetters(optionsCount: number): string[] {
  if (optionsCount < 2 || optionsCount > MAX_OPTIONS) {
    return [];
  }
  return OPTION_LETTERS.slice(0, optionsCount) as unknown as string[];
}

/** Кириллические буквы, визуально похожие на латинские A–J (при вводе с русской раскладки). */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  '\u0410': 'A', // А
  '\u0412': 'B', // В
  '\u0421': 'C', // С
  '\u0414': 'D', // Д
  '\u0415': 'E', // Е
  '\u0424': 'F', // Ф
  '\u0413': 'G', // Г
  '\u041D': 'H', // Н
  '\u0418': 'I', // И
  '\u0419': 'J', // Й
};

/**
 * Нормализует выбор опции: кириллицу → латиница, trim, upper.
 * Чтобы запросы с choice: "С" (кириллица) проходили валидацию как "C".
 */
export function normalizeChoiceLetter(value: unknown): string {
  if (typeof value !== 'string') return (value as string) ?? '';
  const trimmed = value.trim().toUpperCase();
  if (trimmed.length !== 1) return trimmed;
  return CYRILLIC_TO_LATIN[trimmed] ?? trimmed;
}
