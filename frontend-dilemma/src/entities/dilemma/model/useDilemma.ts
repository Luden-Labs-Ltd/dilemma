import { useContext } from "react";
import { DilemmaContext } from "./DilemmaContext";

export function useDilemma() {
  const context = useContext(DilemmaContext);
  if (!context) {
    throw new Error("useDilemma must be used within DilemmaProvider");
  }
  return context;
}

export type { DilemmaContextType } from "./DilemmaContext";

