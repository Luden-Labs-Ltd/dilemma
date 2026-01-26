import { motion } from "framer-motion";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData, useRTLAnimation } from "@/shared/hooks";
import { fetchFeedbackAnalyze, type DilemmaTextData } from "@/shared/lib/api";
import enTranslations from "@/shared/i18n/locales/en/translation.json";
import heTranslations from "@/shared/i18n/locales/he/translation.json";
import slideInsightBackground from "@/shared/assets/insight.png?format=webp";
import aiPersone from "./Gemini_Generated_Image_i4v2t5i4v2t5i4v2 1.png?format=webp";

export function InsightPage() {
  const { t, i18n } = useTranslation();
  const containerAnimation = useRTLAnimation({ duration: 0.5 });
  const contentAnimation = useRTLAnimation({ duration: 0.5, delay: 0.45 });
  const navigate = useNavigate();
  const { currentDilemma, choice, reasonText } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);

  const [counterArguments, setCounterArguments] = useState<string[] | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [aiFeedbackError, setAiFeedbackError] = useState<string | null>(null);
  const [aiRetryTrigger, setAiRetryTrigger] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);

  console.log(counterArguments, "insightData");

  // Extract dilemma text data from translation files
  const dilemmaTextData = useMemo<{
    current: DilemmaTextData | undefined;
    original: DilemmaTextData | undefined;
  }>(() => {
    if (!currentDilemma) return { current: undefined, original: undefined };

    const currentLang = i18n.language as "en" | "he";
    const translations = currentLang === "en" ? enTranslations : heTranslations;
    const originalTranslations = enTranslations;

    const dilemmaData = translations.dilemmas?.[currentDilemma as keyof typeof translations.dilemmas] as
      | {
          title?: string;
          subtitle?: string;
          questionText?: string;
          description?: string;
          reflectionText?: string;
          options?: { a?: string; b?: string };
        }
      | undefined;

    const originalData = originalTranslations.dilemmas?.[currentDilemma as keyof typeof originalTranslations.dilemmas] as
      | {
          title?: string;
          subtitle?: string;
          questionText?: string;
          description?: string;
          reflectionText?: string;
          options?: { a?: string; b?: string };
        }
      | undefined;

    if (!dilemmaData || !originalData || !dilemmaData.title || !dilemmaData.description) {
      return { current: undefined, original: undefined };
    }

    if (!dilemmaData.options?.a || !dilemmaData.options?.b) {
      return { current: undefined, original: undefined };
    }

    if (!originalData.title || !originalData.description || !originalData.options?.a || !originalData.options?.b) {
      return { current: undefined, original: undefined };
    }

    const current: DilemmaTextData = {
      title: dilemmaData.title,
      description: dilemmaData.description,
      options: {
        a: dilemmaData.options.a,
        b: dilemmaData.options.b,
      },
    };

    if (dilemmaData.subtitle) {
      current.subtitle = dilemmaData.subtitle;
    }
    if (dilemmaData.questionText) {
      current.questionText = dilemmaData.questionText;
    }
    if (dilemmaData.reflectionText) {
      current.reflectionText = dilemmaData.reflectionText;
    }

    const original: DilemmaTextData = {
      title: originalData.title,
      description: originalData.description,
      options: {
        a: originalData.options.a,
        b: originalData.options.b,
      },
    };

    if (originalData.subtitle) {
      original.subtitle = originalData.subtitle;
    }
    if (originalData.questionText) {
      original.questionText = originalData.questionText;
    }
    if (originalData.reflectionText) {
      original.reflectionText = originalData.reflectionText;
    }

    return { current, original };
  }, [currentDilemma, i18n.language]);

  const fetchAiFeedback = useCallback(async () => {
    if (!currentDilemma || !choice) return;
    setAiFeedbackLoading(true);
    setAiFeedbackError(null);
    try {
      const args = await fetchFeedbackAnalyze(
        currentDilemma,
        choice,
        reasonText ?? undefined,
        dilemmaTextData.current,
        dilemmaTextData.original
      );
      setCounterArguments(args);
      setHasFetched(true);
    } catch {
      setAiFeedbackError(t("insight.aiFeedback.error"));
    } finally {
      setAiFeedbackLoading(false);
    }
  }, [currentDilemma, choice, reasonText, dilemmaTextData, t]);

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

  const handleNext = () => {
    navigate("/stats");
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
        {...containerAnimation}
        initial={{ 
          ...containerAnimation.initial,
          scale: 0.95
        }}
        animate={{ 
          ...containerAnimation.animate,
          scale: 1
        }}
        transition={{ 
          ...containerAnimation.transition,
          ease: "easeInOut"
        }}
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
          {...contentAnimation}
          initial={{ 
            ...contentAnimation.initial,
            y: 20
          }}
          animate={{ 
            ...contentAnimation.animate,
            y: 0
          }}
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
        onClick={handleNext}
        className="mx-auto mt-8 mb-4 block rounded-[4px] bg-[#E4FFFF] px-10 py-3 font-bold text-black shadow-lg transition-all hover:bg-[#BAEDF0] hover:shadow-xl shrink-0"
      >
        {t("insight.next")}
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
