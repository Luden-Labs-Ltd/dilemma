import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a 0–100 percentage for UI display; matches backend stats. */
export function formatPercent(value: number): string {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n > 100) return "100";
  return String(n);
}

