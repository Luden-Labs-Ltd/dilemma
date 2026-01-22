import { useState, useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { DilemmaType, Choice } from "../../shared/types";
import { DilemmaContext, type DilemmaListItem } from "./DilemmaContext";
import { fetchDilemmas } from "../../shared/lib/api";
import type { ApiError } from "../../shared/lib/api";

export function DilemmaProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [currentDilemma, setCurrentDilemma] = useState<DilemmaType | null>(
    null
  );
  const [choice, setChoice] = useState<Choice | null>(null);
  const [reasonText, setReasonText] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [dilemmas, setDilemmas] = useState<DilemmaListItem[]>([]);
  const [isLoadingDilemmas, setIsLoadingDilemmas] = useState(false);
  const [dilemmasError, setDilemmasError] = useState<string | null>(null);

  const refreshDilemmas = async () => {
    setIsLoadingDilemmas(true);
    setDilemmasError(null);
    try {
      const data = await fetchDilemmas();
      setDilemmas(
        data.map((d) => ({
          name: d.name,
          title: d.title,
          description: d.description,
        }))
      );
    } catch (err) {
      const error = err as ApiError;
      setDilemmasError(
        error.type === "network"
          ? t("dilemmaSelection.error.network")
          : t("dilemmaSelection.error.generic", { message: error.message })
      );
    } finally {
      setIsLoadingDilemmas(false);
    }
  };

  useEffect(() => {
    void refreshDilemmas();
  }, []);

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
        dilemmas,
        isLoadingDilemmas,
        dilemmasError,
        setCurrentDilemma,
        setChoice,
        setReasonText,
        setSkipped,
        refreshDilemmas,
        reset,
      }}
    >
      {children}
    </DilemmaContext.Provider>
  );
}
