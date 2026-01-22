import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";
import { submitInitialChoice, type ApiError } from "@/shared/lib/api";
import type { Choice } from "@/shared/types";

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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="mb-12 text-center"
      >
        <h1 className="mb-3 text-3xl font-bold text-gray-800">
          {dilemma.questionText}
        </h1>
        <p className="text-gray-600">{t("choice.subtitle")}</p>
      </motion.div>

      {/* Фидбэк от сервера */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 max-w-2xl rounded-2xl bg-cyan-50 p-6 text-center text-gray-800"
        >
          <p className="text-lg">{feedback}</p>
        </motion.div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 max-w-2xl rounded-2xl bg-red-50 p-6 text-center text-red-800"
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

      {/* Варианты */}
      <div className="flex flex-wrap justify-center gap-8">
        {dilemma.options.map((option, index) => {
          const isSelected = selectedChoice === option.id;
          const isOther = selectedChoice && selectedChoice !== option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: isOther ? 0.5 : 1,
                scale: isSelected ? 1.05 : 1,
              }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={!selectedChoice ? { scale: 1.05 } : {}}
              whileTap={!selectedChoice ? { scale: 0.98 } : {}}
              onClick={() => handleChoice(option.id)}
              disabled={isSubmitting}
              className={`group relative h-[450px] w-[340px] overflow-hidden rounded-3xl bg-white shadow-xl transition-all ${
                isSelected
                  ? "ring-4 ring-cyan-500 shadow-cyan-200"
                  : "hover:shadow-2xl"
              } ${isSubmitting && !isSelected ? "cursor-not-allowed" : ""}`}
            >
              {/* Изображение placeholder */}
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-cyan-50 via-purple-50 to-blue-50">
                <div className="text-8xl opacity-20">
                  {option.id === "a" ? "🅰️" : "🅱️"}
                </div>
              </div>

              {/* Название опции */}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-6 text-white">
                <h3 className="text-2xl font-bold">{option.label}</h3>
              </div>

              {/* Hover / Selection эффект */}
              <div
                className={`absolute inset-0 transition-opacity ${
                  isSelected
                    ? "bg-cyan-500/20 opacity-100"
                    : "bg-white opacity-0 group-hover:opacity-20"
                }`}
              />

              {/* Галочка при выборе */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
