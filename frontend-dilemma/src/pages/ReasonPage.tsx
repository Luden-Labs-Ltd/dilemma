import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";
import { submitFinalChoice } from "@/shared/lib/api";

export function ReasonPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, choice, setReasonText, setSkipped } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentDilemma || !choice || !dilemma) {
    navigate("/");
    return null;
  }

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const trimmed = value.trim();
    const reasonText = trimmed.length > 0 ? trimmed : null;

    setReasonText(reasonText);
    setSkipped(false);

    // Фиксируем финальное решение в backend
    void submitFinalChoice(currentDilemma, choice);

    setTimeout(() => {
      navigate("/stats");
    }, 300);
  };

  const handleSkip = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    setReasonText(null);
    setSkipped(true);

    // Даже при пропуске текста фиксируем финальное решение в backend
    void submitFinalChoice(currentDilemma, choice);

    setTimeout(() => {
      navigate("/stats");
    }, 300);
  };

  const choiceLabel = choice === "a" ? "א" : "ב";

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full max-w-2xl rounded-3xl bg-white/90 p-8 shadow-2xl backdrop-blur-sm"
      >
        {/* Заголовок */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            {t("reason.title")}
          </h1>
          <p className="text-sm text-gray-600">{t("reason.subtitle")}</p>
        </div>

        {/* Блок с выбором пользователя */}
        <div className="mb-4 rounded-2xl bg-cyan-50 p-4 text-center">
          <p className="text-sm text-gray-600">{t("reason.yourChoice")}</p>
          <p className="text-lg font-bold text-cyan-600">
            {t("reason.option")} {choiceLabel}
          </p>
        </div>

        {/* Textarea */}
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t("reason.label")}
        </label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("reason.placeholder") ?? ""}
          disabled={isSubmitting}
          className="mb-6 h-32 w-full resize-none rounded-2xl border border-gray-200 bg-white/80 p-4 text-gray-800 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 disabled:opacity-50"
        />

        {/* Кнопки */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
          >
            {t("reason.skip")}
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-full bg-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-cyan-600 hover:shadow-xl disabled:opacity-50 sm:w-auto"
          >
            {t("reason.submit")}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
