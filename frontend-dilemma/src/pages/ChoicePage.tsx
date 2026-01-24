import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";
import { submitInitialChoice, type ApiError } from "@/shared/lib/api";
import type { Choice } from "@/shared/types";
import slide11 from "@/shared/assets/slides/medical/slide-11.png";

export function ChoicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, setChoice } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!currentDilemma || !dilemma) {
    navigate("/");
    return null;
  }

  const handleChoice = async (choice: Choice) => {
    if (isSubmitting) return;

    setSelectedChoice(choice);
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      // Сохраняем выбор в контекст
      setChoice(choice);

      // Отправляем initial choice в backend и получаем фидбэк
      const response = await submitInitialChoice(currentDilemma, choice);
      setFeedback(response.feedback);

      // Переход с анимацией после получения фидбэка
      setTimeout(() => {
        navigate("/reason");
      }, 1500);
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.type === "network"
          ? t("choice.error.network")
          : t("choice.error.generic", { message: apiError.message })
      );
      setIsSubmitting(false);
      setSelectedChoice(null);
    }
  };

  const leftOption = dilemma.options[0];
  const rightOption = dilemma.options[1];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0b1d2b]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[92vw] max-w-[1280px] aspect-video">
          <img
            src={slide11}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
          />

          <div className="absolute left-1/2 top-[6%] z-10 w-[80%] -translate-x-1/2 text-center text-[#E6F8F9]">
            <span className="text-[clamp(20px,2.6vw,34px)] font-black leading-tight">
              {dilemma.questionText}
            </span>
          </div>

          <div className="absolute left-[6%] right-[6%] top-[12%] bottom-[12%] grid grid-cols-2 gap-[2.5%]">
            {leftOption && (
              <motion.button
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                whileHover={!selectedChoice ? { scale: 1.01 } : {}}
                whileTap={!selectedChoice ? { scale: 0.99 } : {}}
                onClick={() => handleChoice(leftOption.id)}
                disabled={isSubmitting}
                aria-label={leftOption.label}
                className={`group relative h-full w-full rounded-[28px] outline-none transition-shadow duration-200 hover:shadow-[0_0_40px_rgba(90,210,255,0.35)] focus-visible:shadow-[0_0_40px_rgba(90,210,255,0.45)] ${
                  isSubmitting ? "cursor-not-allowed" : ""
                }`}
              >
                <span className="sr-only">{leftOption.label}</span>
                <div
                  className={`absolute inset-0 rounded-[28px] ring-2 ${
                    selectedChoice === leftOption.id
                      ? "ring-cyan-300/80"
                      : "ring-cyan-300/40 group-hover:ring-cyan-300/70"
                  }`}
                />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white">
                  <span className="text-[clamp(20px,2.4vw,30px)] font-bold leading-tight whitespace-pre-line">
                    {leftOption.label}
                  </span>
                </div>
              </motion.button>
            )}

            {rightOption && (
              <motion.button
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={!selectedChoice ? { scale: 1.01 } : {}}
                whileTap={!selectedChoice ? { scale: 0.99 } : {}}
                onClick={() => handleChoice(rightOption.id)}
                disabled={isSubmitting}
                aria-label={rightOption.label}
                className={`group relative h-full w-full rounded-[28px] outline-none transition-shadow duration-200 hover:shadow-[0_0_40px_rgba(255,120,120,0.35)] focus-visible:shadow-[0_0_40px_rgba(255,120,120,0.45)] ${
                  isSubmitting ? "cursor-not-allowed" : ""
                }`}
              >
                <span className="sr-only">{rightOption.label}</span>
                <div
                  className={`absolute inset-0 rounded-[28px] ring-2 ${
                    selectedChoice === rightOption.id
                      ? "ring-red-300/80"
                      : "ring-red-300/40 group-hover:ring-red-300/70"
                  }`}
                />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white">
                  <span className="text-[clamp(20px,2.4vw,30px)] font-bold leading-tight whitespace-pre-line">
                    {rightOption.label}
                  </span>
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Фидбэк от сервера */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 w-[92vw] max-w-2xl -translate-x-1/2 rounded-2xl bg-cyan-50 p-6 text-center text-gray-800"
        >
          <p className="text-lg">{feedback}</p>
        </motion.div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 w-[92vw] max-w-2xl -translate-x-1/2 rounded-2xl bg-red-50 p-6 text-center text-red-800"
        >
          <p className="mb-3 text-lg">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsSubmitting(false);
              setSelectedChoice(null);
            }}
            className="rounded-full bg-red-500 px-6 py-2 text-white hover:bg-red-600"
          >
            {t("choice.retry")}
          </button>
        </motion.div>
      )}
    </div>
  );
}
