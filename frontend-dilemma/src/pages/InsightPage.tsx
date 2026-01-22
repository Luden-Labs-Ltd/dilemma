import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lightbulb, MessageSquare, BarChart3 } from "lucide-react";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";
import { getInsightData, fetchFeedbackAnalyze } from "@/shared/lib/api";
import { formatPercent } from "@/shared/lib/utils";

type InsightData = Awaited<ReturnType<typeof getInsightData>>;

export function InsightPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, choice, reasonText, skipped, reset } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);

  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counterArguments, setCounterArguments] = useState<string[] | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [aiFeedbackError, setAiFeedbackError] = useState<string | null>(null);
  const [aiRetryTrigger, setAiRetryTrigger] = useState(0);

  const fetchInsight = useCallback(async () => {
    if (!currentDilemma || !choice) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInsightData(currentDilemma, choice, reasonText);
      setInsightData(data);
    } catch {
      setError(t("insight.error"));
    } finally {
      setIsLoading(false);
    }
  }, [currentDilemma, choice, reasonText, t]);

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

  useEffect(() => {
    void fetchInsight();
  }, [fetchInsight]);

  useEffect(() => {
    if (!insightData || !currentDilemma || !choice) return;
    void fetchAiFeedback();
  }, [insightData, currentDilemma, choice, aiRetryTrigger, fetchAiFeedback]);

  if (!currentDilemma || !choice || !dilemma) {
    navigate("/");
    return null;
  }

  if (isLoading && !insightData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">{t("insight.loading")}</p>
      </div>
    );
  }

  if (error && !insightData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => void fetchInsight()}
          className="rounded-full bg-cyan-500 px-6 py-2 text-white hover:bg-cyan-600"
        >
          {t("insight.retry")}
        </button>
      </div>
    );
  }

  const data = insightData!;

  const handleFinish = () => {
    reset();
    navigate("/");
  };

  return (
    <div className="relative flex min-h-screen justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="my-4 w-full max-w-3xl overflow-y-auto rounded-3xl bg-white/90 p-10 shadow-2xl backdrop-blur-sm"
      >
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
            <Lightbulb className="h-8 w-8 text-cyan-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {t("insight.title")}
          </h1>
        </motion.div>

        {/* Блок: Твой выбор */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 rounded-2xl bg-cyan-50 p-6"
        >
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-600" />
            <h3 className="font-bold text-gray-800">{t("insight.yourChoice")}</h3>
          </div>
          <p className="text-lg text-cyan-700">
            {t("insight.option")} {data.choiceLabel}
          </p>
        </motion.div>

        {/* Блок: Твоё объяснение */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 rounded-2xl bg-gray-50 p-6"
        >
          <div className="mb-2 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <h3 className="font-bold text-gray-800">
              {t("insight.yourReason")}
            </h3>
          </div>
          {reasonText ? (
            <p className="italic text-gray-700">"{reasonText}"</p>
          ) : (
            <p className="text-gray-500">
              {skipped ? t("insight.skipped") : t("insight.noReason")}
            </p>
          )}
        </motion.div>

        {/* Блок: Статистика сообщества */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6 rounded-2xl bg-purple-50 p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-gray-800">
              {t("insight.communityStats")}
            </h3>
          </div>
          <div className="space-y-3">
            {/* Бар A */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>{t("insight.optionA")}</span>
                <span className="font-bold">{formatPercent(data.stats.aPercent)}%</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${formatPercent(data.stats.aPercent)}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="h-full rounded-full bg-cyan-500"
                />
              </div>
            </div>
            {/* Бар B */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>{t("insight.optionB")}</span>
                <span className="font-bold">{formatPercent(data.stats.bPercent)}%</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${formatPercent(data.stats.bPercent)}%` }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="h-full rounded-full bg-purple-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Блок: Интерпретация */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6 rounded-2xl border-2 border-cyan-200 bg-white p-6 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
        >
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-cyan-600" />
            <h3 className="font-bold text-gray-800">
              {t("insight.interpretation")}
            </h3>
          </div>
          <p className="leading-relaxed text-gray-700">
            {data.interpretation}
          </p>
        </motion.div>

        {/* Блок: AI-контраргументы */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mb-8 rounded-2xl bg-amber-50 p-6"
        >
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-gray-800">
              {t("insight.aiFeedback.title")}
            </h3>
          </div>
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
                <p className="text-gray-600">{t("insight.aiFeedback.empty")}</p>
              ) : (
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {counterArguments.map((arg, i) => (
                    <li key={i}>{arg}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </motion.div>

        {/* Кнопка завершения */}
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
