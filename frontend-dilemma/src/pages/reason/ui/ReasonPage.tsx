import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "@/entities/dilemma";
import { useDilemmaData } from "@/entities/dilemma";
import { useRTLAnimation, useIsMdOrLarger } from "@/shared/hooks";
import { submitFinalChoice, type ApiError } from "@/shared/lib/api";
import bgImage from "@/shared/assets/dilemmas/common/reason-background.png?format=webp";
import logoImg from "@/shared/assets/logo.png?format=webp";
import { isModernThemeDilemma } from "@/shared/config/dilemma-theme";
import modernThemeReasonFrame from "@/shared/assets/dilemmas/doctor/reason-frame.png?format=webp";

export function ReasonPage() {
  const { t } = useTranslation();
  const titleAnimation = useRTLAnimation({ duration: 0.6 });
  const textareaAnimation = useRTLAnimation({ duration: 0.7, delay: 0.2 });
  const buttonAnimation = useRTLAnimation({ duration: 0.6, delay: 0.4 });
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

  const isModernTheme = isModernThemeDilemma(currentDilemma);
  const isMdOrLarger = useIsMdOrLarger();

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
    <div
      className="relative flex min-h-screen flex-col px-4 py-12"
      style={isModernTheme ? { backgroundColor: "#011627" } : undefined}
    >
      <img
        src={logoImg}
        alt=""
        aria-hidden="true"
        className="mx-auto mb-4 h-auto w-[min(200px,50vw)] max-w-[260px] object-contain"
      />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
        {/* Вопрос */}
        <motion.div
          {...titleAnimation}
          initial={{ 
            ...titleAnimation.initial,
            y: -30
          }}
          animate={{ 
            ...titleAnimation.animate,
            y: 0
          }}
          transition={{ 
            ...titleAnimation.transition,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mb-8 text-center"
        >
          <h1 className="text-2xl font-bold text-white">
            {t("reason.title")}
          </h1>
        </motion.div>

        {/* Textarea с футуристической рамкой */}
        <motion.div
          {...textareaAnimation}
          initial={{ 
            ...textareaAnimation.initial,
            scale: 0.9,
            y: 20
          }}
          animate={{ 
            ...textareaAnimation.animate,
            scale: 1,
            y: 0
          }}
          transition={{ 
            ...textareaAnimation.transition,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mb-8"
        >
          <div
            className="relative min-h-[271px] md:min-h-[371px] max-w-[1026px] overflow-hidden rounded-xl"
            style={
              isMdOrLarger
                ? {
                    backgroundImage: `url(${isModernTheme ? modernThemeReasonFrame : bgImage})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }
                : {
                    backgroundColor: "transparent",
                    border: "2px solid rgba(0, 212, 255, 0.4)",
                  }
            }
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
          {...buttonAnimation}
          initial={{ 
            ...buttonAnimation.initial,
            y: 30
          }}
          animate={{ 
            ...buttonAnimation.animate,
            y: 0
          }}
          transition={{ 
            ...buttonAnimation.transition,
            ease: [0.16, 1, 0.3, 1]
          }}
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
