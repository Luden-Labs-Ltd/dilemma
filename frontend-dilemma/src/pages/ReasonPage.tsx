import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";
import { submitFinalChoice, type ApiError } from "@/shared/lib/api";
import bgImage from "./bg1 1.png?format=webp";

export function ReasonPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, choice, setReasonText, setSkipped } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentDilemma || !choice || !dilemma) {
    navigate("/");
    return null;
  }

  const submitFinal = async (trimmedReason: string | null, skippedReason: boolean) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setReasonText(trimmedReason);
    setSkipped(skippedReason);

    try {
      await submitFinalChoice(currentDilemma, choice);
      navigate("/insight");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(
        apiErr.type === "network"
          ? t("reason.error.network")
          : t("reason.error.generic", { message: apiErr.message })
      );
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    const reasonText = trimmed.length > 0 ? trimmed : null;
    void submitFinal(reasonText, false);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#011627] px-4 py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
        {/* Вопрос */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 text-center"
        >
          <h1 className="text-2xl font-bold text-white">
            {t("reason.title")}
          </h1>
        </motion.div>

        {/* Textarea с футуристической рамкой */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div
            className="relative min-h-[271px] md:min-h-[371px] max-w-[1026px] overflow-hidden"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <motion.textarea
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t("reason.placeholder") ?? ""}
              disabled={isSubmitting}
              className="my-[30px] absolute inset-0 z-10 resize-none bg-transparent text-base text-white placeholder:text-[#00d4ff]/60 outline-none disabled:opacity-50 py-[100px] px-[50px] md:py-[40px] md:px-[40px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            />
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 rounded-2xl bg-red-50 p-4 text-center text-red-700"
          >
            <p className="mb-3">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              {t("reason.retry")}
            </button>
          </motion.div>
        )}

        {/* Кнопка Continue */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-[222px] h-[60px] text-black rounded-[4px] bg-[#E4FFFF] px-12 py-4 text-lg font-bold shadow-lg transition-all hover:bg-[#BAEDF0] hover:shadow-xl disabled:opacity-50"
          >
            {t("reason.next")}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
