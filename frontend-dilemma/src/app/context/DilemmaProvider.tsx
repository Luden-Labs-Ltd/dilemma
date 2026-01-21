import { useState, type ReactNode } from "react";
import type { DilemmaType, Choice } from "../../shared/types";
import { DilemmaContext } from "./DilemmaContext";

export function DilemmaProvider({ children }: { children: ReactNode }) {
  const [currentDilemma, setCurrentDilemma] = useState<DilemmaType | null>(
    null
  );
  const [choice, setChoice] = useState<Choice | null>(null);
  const [reasonText, setReasonText] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(false);

  const reset = () => {
    setCurrentDilemma(null);
    setChoice(null);
    setReasonText(null);
    setSkipped(false);
  };

  return (
    <DilemmaContext.Provider
      value={{
        currentDilemma,
        choice,
        reasonText,
        skipped,
        setCurrentDilemma,
        setChoice,
        setReasonText,
        setSkipped,
        reset,
      }}
    >
      {children}
    </DilemmaContext.Provider>
  );
}
