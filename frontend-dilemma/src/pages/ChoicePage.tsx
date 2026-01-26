import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData, useRTLAnimation } from "@/shared/hooks";
import { submitInitialChoice, type ApiError } from "@/shared/lib/api";
import type { Choice } from "@/shared/types";
import slideStats from "@/shared/assets/slides/medical/slide-stat.png?format=webp";
import decorativeFrame from "@/shared/assets/decorative-frame.png?format=webp";

// Хук для эффекта печатания с поддержкой RTL
function useTypewriter(
  text: string,
  isRTL: boolean,
  speed: number = 50,
  delay: number = 0
) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      return;
    }

    setDisplayedText("");
    setIsComplete(false);

    const startTimeout = setTimeout(() => {
      let charIndex = 0;
      const interval = setInterval(() => {
        charIndex++;
        if (isRTL) {
          // RTL: берем символы с конца
          setDisplayedText(text.slice(-charIndex));
        } else {
          // LTR: берем символы с начала
          setDisplayedText(text.slice(0, charIndex));
        }

        if (charIndex >= text.length) {
          clearInterval(interval);
          setIsComplete(true);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, isRTL, speed, delay]);

  return { displayedText, isComplete };
}

export function ChoicePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, setChoice } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<"left" | "right" | null>(null);

  const isRTL = i18n.language === "he";

  // Левая карточка (голубой фон) = option A
  // Правая карточка (красный фон) = option B
  const leftTexts = dilemma?.options[0]?.label.split("\n") ?? ["", ""];
  const rightTexts = dilemma?.options[1]?.label.split("\n") ?? ["", ""];

  // При RTL анимация начинается с правой карточки
  const leftDelay = isRTL ? ((rightTexts[0]?.length ?? 0) + (rightTexts[1]?.length ?? 0)) * 40 + 400 : 0;
  const rightDelay = isRTL ? 0 : ((leftTexts[0]?.length ?? 0) + (leftTexts[1]?.length ?? 0)) * 40 + 400;

  // Typewriter для левой карточки
  const leftTitle = useTypewriter(leftTexts[0] ?? "", isRTL, 40, leftDelay);
  const leftSubtitle = useTypewriter(leftTexts[1] ?? "", isRTL, 40, leftDelay + (leftTexts[0]?.length ?? 0) * 40 + 200);

  // Typewriter для правой карточки
  const rightTitle = useTypewriter(rightTexts[0] ?? "", isRTL, 40, rightDelay);
  const rightSubtitle = useTypewriter(rightTexts[1] ?? "", isRTL, 40, rightDelay + (rightTexts[0]?.length ?? 0) * 40 + 200);

  const leftCardAnimation = useRTLAnimation({ duration: 0.4, delay: 0.1 });
  const rightCardAnimation = useRTLAnimation({ duration: 0.4, delay: 0.2 });
  const errorAnimation = useRTLAnimation({ duration: 0.4 });

  if (!currentDilemma || !dilemma) {
    navigate("/");
    return null;
  }

  const handleChoice = async (choice: Choice) => {
    if (isSubmitting) return;

    setSelectedChoice(choice);
    setIsSubmitting(true);
    setError(null);

    try {
      // Сохраняем выбор в контекст
      setChoice(choice);

      // Отправляем initial choice в backend
      await submitInitialChoice(currentDilemma, choice);

      // Переход с анимацией
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
            src={slideStats}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
          />

          <div className="absolute left-1/2 top-[-3%] z-10 w-[80%] -translate-x-1/2 text-center text-[#E6F8F9]">
            <span className="text-[clamp(16px,2.2vw,34px)] font-black leading-tight">
              {dilemma.questionText}
            </span>
          </div>

          <div
            className="absolute left-[6%] right-[6%] top-[12%] bottom-[12%] grid grid-cols-2 gap-[2.5%]"
            style={{ direction: "ltr" }}
          >
            {leftOption && (
              <motion.button
                {...leftCardAnimation}
                initial={{ 
                  ...leftCardAnimation.initial,
                  scale: 0.98
                }}
                animate={{ 
                  ...leftCardAnimation.animate,
                  scale: 1
                }}
                whileTap={!selectedChoice ? { scale: 0.99 } : {}}
                onClick={() => handleChoice(leftOption.id)}
                onMouseEnter={() => setHoveredOption("left")}
                onMouseLeave={() => setHoveredOption(null)}
                disabled={isSubmitting}
                aria-label={leftOption.label}
                className={`relative h-full w-full rounded-[28px] outline-none ${
                  isSubmitting ? "cursor-not-allowed" : ""
                }`}
              >
                <span className="sr-only">{leftOption.label}</span>
                {/* Декоративная рамка при наведении */}
                <AnimatePresence>
                  {hoveredOption === "left" && !selectedChoice && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.48 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage: `url(${decorativeFrame})`,
                        backgroundSize: "100% 100%",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  )}
                </AnimatePresence>
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center gap-[0.5vw] px-[8%]"
                  style={{ direction: isRTL ? "rtl" : "ltr" }}
                >
                  <span
                    className="font-['Heebo'] font-black text-[clamp(10px,2.8vw,60px)] leading-[1.15] uppercase max-w-full"
                    style={{ color: "#B7ECF7" }}
                  >
                    {leftTitle.displayedText}
                  </span>
                  {leftTexts[1] && (
                    <span
                      className="font-['Heebo'] font-normal text-[clamp(8px,2.2vw,52px)] leading-[1.1] max-w-full"
                      style={{ color: "#B7ECF7" }}
                    >
                      {leftSubtitle.displayedText}
                    </span>
                  )}
                </div>
              </motion.button>
            )}

            {rightOption && (
              <motion.button
                {...rightCardAnimation}
                initial={{ 
                  ...rightCardAnimation.initial,
                  scale: 0.98
                }}
                animate={{ 
                  ...rightCardAnimation.animate,
                  scale: 1
                }}
                whileTap={!selectedChoice ? { scale: 0.99 } : {}}
                onClick={() => handleChoice(rightOption.id)}
                onMouseEnter={() => setHoveredOption("right")}
                onMouseLeave={() => setHoveredOption(null)}
                disabled={isSubmitting}
                aria-label={rightOption.label}
                className={`relative h-full w-full rounded-[28px] outline-none ${
                  isSubmitting ? "cursor-not-allowed" : ""
                }`}
              >
                <span className="sr-only">{rightOption.label}</span>
                {/* Декоративная рамка при наведении (отзеркаленная) */}
                <AnimatePresence>
                  {hoveredOption === "right" && !selectedChoice && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.48 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage: `url(${decorativeFrame})`,
                        backgroundSize: "100% 100%",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        transform: "scaleX(-1)",
                      }}
                    />
                  )}
                </AnimatePresence>
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center gap-[0.5vw] px-[8%]"
                  style={{ direction: isRTL ? "rtl" : "ltr" }}
                >
                  <span
                    className="font-['Heebo'] font-black text-[clamp(10px,2.8vw,60px)] leading-[1.15] uppercase max-w-full"
                    style={{ color: "#FCD1CF" }}
                  >
                    {rightTitle.displayedText}
                  </span>
                  {rightTexts[1] && (
                    <span
                      className="font-['Heebo'] font-normal text-[clamp(8px,2.2vw,52px)] leading-[1.1] max-w-full"
                      style={{ color: "#FCD1CF" }}
                    >
                      {rightSubtitle.displayedText}
                    </span>
                  )}
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <motion.div
          {...errorAnimation}
          initial={{ 
            ...errorAnimation.initial,
            y: 10
          }}
          animate={{ 
            ...errorAnimation.animate,
            y: 0
          }}
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
