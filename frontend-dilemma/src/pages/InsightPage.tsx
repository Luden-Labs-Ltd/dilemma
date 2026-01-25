import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";
import { fetchFeedbackAnalyze } from "@/shared/lib/api";
import slideInsightBackground from "@/shared/assets/insight.png?format=webp";
import aiPersone from "./Gemini_Generated_Image_i4v2t5i4v2t5i4v2 1.png?format=webp";

export function InsightPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, choice, reasonText, reset } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);

  const [counterArguments, setCounterArguments] = useState<string[] | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [aiFeedbackError, setAiFeedbackError] = useState<string | null>(null);
  const [aiRetryTrigger, setAiRetryTrigger] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);

  console.log(counterArguments, "insightData");

  const fetchAiFeedback = useCallback(async () => {
    if (!currentDilemma || !choice) return;
    setAiFeedbackLoading(true);
    setAiFeedbackError(null);
    try {
      const args = await fetchFeedbackAnalyze(
        currentDilemma,
        choice,
        reasonText ?? undefined
      );
      setCounterArguments(args);
      setHasFetched(true);
    } catch {
      setAiFeedbackError(t("insight.aiFeedback.error"));
    } finally {
      setAiFeedbackLoading(false);
    }
  }, [currentDilemma, choice, reasonText, t]);

  useEffect(() => {
    if (!currentDilemma || !choice || hasFetched) return;
    void fetchAiFeedback();
  }, [currentDilemma, choice, hasFetched, fetchAiFeedback]);

  useEffect(() => {
    if (aiRetryTrigger > 0) {
      void fetchAiFeedback();
    }
  }, [aiRetryTrigger, fetchAiFeedback]);

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
    <div className="flex min-h-screen flex-col items-center justify-center p-2">
      {/* Картинка вне блока на мобильных */}
      <img
        src={aiPersone}
        alt="ai"
        className="w-[120px] mb-[20px] flex-shrink-0 sm:hidden"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative flex max-h-[90vw] max-w-[95vw] w-full h-full flex-col items-center justify-center overflow-hidden rounded-xl py-8 px-6"
        style={{ backgroundImage: `url(${slideInsightBackground})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundBlendMode: "multiply" }}
      >
        {/* Картинка внутри блока на планшетах и десктопе */}
        <img
          src={aiPersone}
          alt="ai"
          className="hidden sm:block sm:w-[150px] md:w-[180px] mb-[25px] md:mb-[30px] flex-shrink-0"
        />

        {/* Блок: AI-контраргументы */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col items-center justify-center text-center max-w-2xl w-full"
        >
          {
            !!counterArguments?.length && (
              <span className="text-[#bbeff3] text-xl font-bold mb-[20px]">
                {t("insight.aiFeedback.title")}
              </span>
            )
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
                <div className="max-h-[400px] overflow-y-auto w-full custom-scrollbar">
                  <ul className="list-inside list-disc space-y-2 sm:space-y-3 text-start text-white text-sm sm:text-base w-full pr-2">
                    {counterArguments.map((arg, i) => (
                      <li key={i} className="leading-relaxed">{arg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </motion.div>


      </motion.div>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleFinish}
        className="mx-auto mt-8 mb-4 block rounded-[8px] bg-[#E4FFFF] px-10 py-3 font-bold text-black shadow-lg transition-all hover:bg-cyan-600 hover:shadow-xl flex-shrink-0"
      >
        {t("insight.finish")}
      </motion.button>
      <style>{`
        .custom-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .custom-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
}
