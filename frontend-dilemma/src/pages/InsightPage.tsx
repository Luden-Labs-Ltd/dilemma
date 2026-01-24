import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lightbulb, MessageSquare, BarChart3 } from "lucide-react";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";
import { getInsightData, fetchFeedbackAnalyze } from "@/shared/lib/api";
import { formatPercent } from "@/shared/lib/utils";
import slideInsightBackground from "@/shared/assets/insight.png";
import aiPersone from "@/shared/assets/ai.webp";

type InsightData = Awaited<ReturnType<typeof getInsightData>>;

export function InsightPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, choice, reasonText, skipped, reset } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);

  // const [insightData, setInsightData] = useState<InsightData | null>(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [counterArguments, setCounterArguments] = useState<string[] | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [aiFeedbackError, setAiFeedbackError] = useState<string | null>(null);
  const [aiRetryTrigger, setAiRetryTrigger] = useState(0);

  // const fetchInsight = useCallback(async () => {
  //   if (!currentDilemma || !choice) return;
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const data = await getInsightData(currentDilemma, choice, reasonText);
  //     setInsightData(data);
  //   } catch {
  //     setError(t("insight.error"));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [currentDilemma, choice, reasonText, t]);


  console.log(counterArguments, "insightData");

  const fetchAiFeedback = useCallback(async () => {
    if (!currentDilemma || !choice) return;
    setAiFeedbackLoading(true);
    setAiFeedbackError(null);
    setCounterArguments(null);
    try {
      const args = await fetchFeedbackAnalyze(
        currentDilemma,
        choice,
        reasonText ?? undefined
      );
      setCounterArguments(args);
    } catch {
      setAiFeedbackError(t("insight.aiFeedback.error"));
    } finally {
      setAiFeedbackLoading(false);
    }
  }, [currentDilemma, choice, reasonText, t]);

  // useEffect(() => {
  //   void fetchInsight();
  // }, [fetchInsight]);

  useEffect(() => {
    if (!currentDilemma || !choice) return;
    void fetchAiFeedback();
  }, [currentDilemma, choice, aiRetryTrigger, fetchAiFeedback]);

  if (!currentDilemma || !choice || !dilemma) {
    navigate("/");
    return null;
  }

  if (aiFeedbackLoading && !counterArguments) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">{t("insight.loading")}</p>
      </div>
    );
  }

  if (aiFeedbackError && !counterArguments) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600">{aiFeedbackError}</p>
        <button
          type="button"
          onClick={() => void fetchAiFeedback()}
          className="rounded-full bg-cyan-500 px-6 py-2 text-white hover:bg-cyan-600"
        >
          {t("insight.retry")}
        </button>
      </div>
    );
  }

  const handleFinish = () => {
    reset();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative flex min-h-[90vh] w-[95vw] flex-col items-center justify-center overflow-y-auto rounded-xl p-6"
        style={{ backgroundImage: `url(${slideInsightBackground})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundBlendMode: "multiply" }}
      >

        <img src={aiPersone} alt="ai" className="w-[120px] mb-[20px]" />

        {/* Блок: AI-контраргументы */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col items-center justify-center text-center max-w-2xl"
        >
          {
            !!counterArguments?.length && (<span className="text-[#bbeff3] mb-[20px]">{t("insight.aiFeedback.title")}</span>)
          }
          {aiFeedbackLoading && (
            <p className="text-amber-700">{t("insight.aiFeedback.loading")}</p>
          )}
          {aiFeedbackError && !aiFeedbackLoading && (
            <div className="flex flex-col gap-2">
              <p className="text-red-600">{aiFeedbackError}</p>
              <button
                type="button"
                onClick={() => setAiRetryTrigger((n) => n + 1)}
                className="w-fit rounded-full bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
              >
                {t("insight.aiFeedback.retry")}
              </button>
            </div>
          )}
          {!aiFeedbackLoading && !aiFeedbackError && counterArguments !== null && (
            <>
              {counterArguments.length === 0 ? (
                <p className="text-[#bbeff3]">{t("insight.aiFeedback.empty")}</p>
              ) : (
                <ul className="list-inside list-disc space-y-2 text-start text-white">
                  {counterArguments.map((arg, i) => (
                    <li key={i}>{arg}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFinish}
          className="mx-auto mt-8 block rounded-full bg-cyan-500 px-10 py-3 font-bold text-white shadow-lg transition-all hover:bg-cyan-600 hover:shadow-xl"
        >
          {t("insight.finish")}
        </motion.button>
      </motion.div>
    </div>
  );
}
