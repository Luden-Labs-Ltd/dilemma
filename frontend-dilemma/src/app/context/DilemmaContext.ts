import { createContext } from "react";
import type { DilemmaType, Choice } from "../../shared/types";

export interface DilemmaListItem {
  name: string;
  title: string;
  description: string;
  participantCount?: number;
}

export interface DilemmaContextType {
  currentDilemma: DilemmaType | null;
  choice: Choice | null;
  reasonText: string | null;
  skipped: boolean;
  dilemmas: DilemmaListItem[];
  isLoadingDilemmas: boolean;
  dilemmasError: string | null;
  setCurrentDilemma: (dilemma: DilemmaType) => void;
  setChoice: (choice: Choice) => void;
  setReasonText: (text: string | null) => void;
  setSkipped: (skipped: boolean) => void;
  refreshDilemmas: () => Promise<void>;
  reset: () => void;
}

export const DilemmaContext = createContext<DilemmaContextType | undefined>(
  undefined
);
