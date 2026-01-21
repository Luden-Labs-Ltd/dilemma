import { createContext } from "react";
import type { DilemmaType, Choice } from "../../shared/types";

export interface DilemmaContextType {
  currentDilemma: DilemmaType | null;
  choice: Choice | null;
  reasonText: string | null;
  skipped: boolean;
  setCurrentDilemma: (dilemma: DilemmaType) => void;
  setChoice: (choice: Choice) => void;
  setReasonText: (text: string | null) => void;
  setSkipped: (skipped: boolean) => void;
  reset: () => void;
}

export const DilemmaContext = createContext<DilemmaContextType | undefined>(
  undefined
);
