import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { DilemmaType, Choice } from "../../shared/types";
import { DilemmaContext, type DilemmaListItem } from "./DilemmaContext";
import { fetchDilemmas } from "../../shared/lib/api";
import type { ApiError } from "../../shared/lib/api";
import {
  loadFlowState,
  saveFlowState,
  clearFlowState,
} from "../../shared/lib/flowStateStorage";
import { useMyDecisions } from "../../shared/hooks/useMyDecisions";

export function DilemmaProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { decisions: myDecisions, refresh: refreshMyDecisions } =
    useMyDecisions();
  const [currentDilemma, setCurrentDilemma] = useState<DilemmaType | null>(
    null
  );
  const [choice, setChoice] = useState<Choice | null>(null);
  const [reasonText, setReasonText] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [dilemmasBase, setDilemmasBase] = useState<DilemmaListItem[]>([]);
  const [isLoadingDilemmas, setIsLoadingDilemmas] = useState(false);
  const [dilemmasError, setDilemmasError] = useState<string | null>(null);

  const completedSet = useMemo(
    () =>
      new Set(
        myDecisions
          .filter((d) => d.finalChoice != null)
          .map((d) => d.dilemmaName)
      ),
    [myDecisions]
  );

  const dilemmas = useMemo(
    () =>
      dilemmasBase.map((d) => ({
        ...d,
        isCompletedByUser: completedSet.has(d.name),
      })),
    [dilemmasBase, completedSet]
  );

  useEffect(() => {
    const saved = loadFlowState();
    if (!saved?.currentDilemma) return;
    setCurrentDilemma(saved.currentDilemma as DilemmaType);
    setChoice(saved.choice);
    setReasonText(saved.reasonText);
    setSkipped(saved.skipped);
  }, []);

  useEffect(() => {
    if (!currentDilemma) return;
    saveFlowState({
      currentDilemma,
      choice,
      reasonText,
      skipped,
    });
  }, [currentDilemma, choice, reasonText, skipped]);

  const refreshDilemmas = useCallback(async () => {
    setIsLoadingDilemmas(true);
    setDilemmasError(null);
    try {
      const data = await fetchDilemmas();
      setDilemmasBase(
        data.map((d) => ({
          name: d.name,
          title: d.title,
          description: d.description,
        }))
      );
      try {
        await refreshMyDecisions();
      } catch {
        // History load failure does not block list display
      }
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
  }, [t, refreshMyDecisions]);

  const reset = () => {
    clearFlowState();
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
