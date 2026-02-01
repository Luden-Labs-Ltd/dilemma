import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "@/entities/dilemma";
import { useDilemmaData } from "@/entities/dilemma";
import { useRTLAnimation } from "@/shared/hooks";
import { submitInitialChoice, submitFinalChoice, type ApiError } from "@/shared/lib/api";
import type { Choice, OptionId } from "@/shared/types";
import slideStats from "@/shared/assets/slides/medical/slide-stat.png?format=webp";
import decorativeFrame from "@/shared/assets/dilemmas/common/choice-decorative-frame.png?format=webp";
import logoImg from "@/shared/assets/logo.png?format=webp";
import {
  isModernThemeDilemma,
  getModernThemeBackground,
  getModernThemeOverlayOpacity,
} from "@/shared/config/dilemma-theme";
import modernThemeChoiceFrame from "@/shared/assets/dilemmas/doctor/choice-frame.png?format=webp";
import backgroundGradient from "@/shared/assets/background-gradient.png?format=webp";

export function ChoicePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, setChoice } = useDilemma();

  console.log(currentDilemma, "currentDilemmacurrentDilemmacurrentDilemmacurrentDilemmacurrentDilemma");
  
  const dilemma = useDilemmaData(currentDilemma);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isRTL = i18n.language === "he";
  const errorAnimation = useRTLAnimation({ duration: 0.4 });
  const cardAnimations = [
    useRTLAnimation({ duration: 0.4, delay: 0.1 }),
    useRTLAnimation({ duration: 0.4, delay: 0.2 }),
    useRTLAnimation({ duration: 0.4, delay: 0.3 }),
  ];

  // Текст показываем после завершения анимации появления карточек (правая: delay 0.2 + duration 0.4)
  const [showText, setShowText] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowText(true), 650);
    return () => clearTimeout(t);
  }, []);

  if (!currentDilemma || !dilemma) {
    navigate("/");
    return null;
  }

  /** Для API: OptionId (a|b|c) в Choice (A|B); опция c маппится в B */
  const choiceForApi = (optionId: OptionId): Choice =>
    optionId === "a" ? "A" : optionId === "b" ? "B" : "B";

  const handleChoice = async (optionId: OptionId) => {
    if (isSubmitting) return;
    const choice = choiceForApi(optionId);

    setSelectedChoice(choice);
    setIsSubmitting(true);
    setError(null);

    try {
      setChoice(choice);
      await submitInitialChoice(currentDilemma, choice);
      // Reason-шаг отключён в роутере — сразу фиксируем финальный выбор, иначе статистика остаётся 0
      await submitFinalChoice(currentDilemma, choice);

      // Переход с анимацией (reason временно скрыт — идём сразу в insight)
      setTimeout(() => {
        navigate("/insight");
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

  const options = dilemma.options;
  const isThreeCards = options.length === 3;
  const isModernTheme = isModernThemeDilemma(currentDilemma);
  const modernBg = getModernThemeBackground(currentDilemma);
  const overlayOpacity = getModernThemeOverlayOpacity(currentDilemma);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-black/20"
      style={
        modernBg
          ? {
              backgroundImage: `url(${modernBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {
            backgroundImage: `url(${backgroundGradient})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
      }
    >
      {/* Оверлей затемнения фона: ai-autonomy 60%, privacy-vs-security 70% */}
      {isModernTheme && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
          aria-hidden
        />
      )}
      <img
        src={logoImg}
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-4 z-20 h-auto w-[min(200px,50vw)] max-w-[260px] -translate-x-1/2 object-contain"
      />
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="relative w-[92vw] max-w-[1280px] aspect-video">
          {!isModernTheme && (
            <img
              src={slideStats}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
            />
          )}

          <div className="absolute left-1/2 top-[-3%] z-10 w-[80%] -translate-x-1/2 text-center text-[#E6F8F9]">
            <span className="text-[clamp(16px,2.2vw,34px)] font-black leading-tight">
              {dilemma.questionText}
            </span>
          </div>

          <div
            className={`absolute grid ${
              isThreeCards
                ? "left-[6%] right-[6%] top-1/2 -translate-y-1/2 aspect-[3/1] h-auto md:left-[1%] md:right-[1%] lg:left-[0.5%] lg:right-[0.5%] xl:left-0 xl:right-0 grid-cols-3 gap-[2.5%] md:gap-[0.75%] lg:gap-[0.5%] xl:gap-[0.25%]"
                : "left-[6%] right-[6%] top-[12%] bottom-[12%] md:left-[1%] md:right-[1%] md:top-[5%] md:bottom-[5%] lg:left-[0.5%] lg:right-[0.5%] lg:top-[3%] lg:bottom-[4%] xl:left-[3%] xl:right-[3%] xl:top-[6%] xl:bottom-[7%] grid-cols-2 gap-[2.5%] md:gap-[0.75%] lg:gap-[0.5%] xl:gap-[2%]"
            }`}
            style={{ direction: "ltr" }}
          >
            {options.map((option, index) => {
              const cardAnimation = cardAnimations[index] ?? cardAnimations[0];
              const texts = option.label.split("\n");
              const mirrorFrame = !isThreeCards && index === 1;
              const isRightColor = !isThreeCards && index === 1;
              const textColorTitle = isModernTheme
                ? "#E6F8F9"
                : isRightColor
                  ? "#FCD1CF"
                  : "#B7ECF7";
              const textColorSub = isModernTheme ? "#FFFFFF" : textColorTitle;

              return (
                <motion.button
                  key={option.id}
                  {...cardAnimation}
                  initial={{ ...cardAnimation.initial, scale: 0.98 }}
                  animate={{ ...cardAnimation.animate, scale: 1 }}
                  whileTap={!selectedChoice ? { scale: 0.99 } : {}}
                  onClick={() => handleChoice(option.id)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  disabled={isSubmitting}
                  aria-label={option.label}
                  className={`relative h-full w-full rounded-[28px] outline-none ${
                    isSubmitting ? "cursor-not-allowed" : ""
                  }`}
                >
                  <span className="sr-only">{option.label}</span>
                  {isModernTheme ? (
                    <>
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          backgroundImage: `url(${modernThemeChoiceFrame})`,
                          backgroundSize: "100% 100%",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          transform: mirrorFrame ? "scaleX(-1)" : undefined,
                        }}
                      />
                      <AnimatePresence>
                        {hoveredIndex === index && !selectedChoice && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pointer-events-none absolute inset-0 z-1"
                            style={{
                              backgroundImage: `url(${modernThemeChoiceFrame})`,
                              backgroundSize: "100% 100%",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                              transform: mirrorFrame ? "scaleX(-1)" : undefined,
                              mixBlendMode: "screen",
                              filter: "brightness(1.6)",
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <AnimatePresence>
                      {hoveredIndex === index && !selectedChoice && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.48 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pointer-events-none absolute inset-0 choice-decorative-frame"
                          style={{
                            backgroundImage: `url(${decorativeFrame})`,
                            backgroundSize: "100% 100%",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            ["--choice-frame-mirror" as string]: mirrorFrame ? "-1" : "1",
                          } as CSSProperties}
                        />
                      )}
                    </AnimatePresence>
                  )}
                  <div
                    className={`absolute inset-0 z-10 flex min-w-0 flex-col items-center justify-center overflow-hidden wrap-break-word text-center transition-opacity duration-200 ${
                      isThreeCards
                        ? "gap-0.5 px-[8%] py-[6%]"
                        : isModernTheme
                          ? "gap-[0.3vw] px-[12%] py-[8%]"
                          : "gap-[0.5vw] px-[8%]"
                    }`}
                    style={{
                      direction: isRTL ? "rtl" : "ltr",
                      opacity: showText ? 1 : 0,
                    }}
                  >
                    {isThreeCards ? (
                      <span
                        className="font-['Heebo'] font-black leading-snug max-w-full shrink-0 text-center text-[clamp(6px,1.1vw,16px)] sm:text-[clamp(7px,1.3vw,20px)] whitespace-pre-line"
                        style={{ color: textColorTitle }}
                      >
                        {option.label}
                      </span>
                    ) : (
                      <>
                        <span
                          className={`font-['Heebo'] font-black uppercase leading-tight max-w-full ${
                            isModernTheme
                              ? "text-[clamp(8px,1.8vw,28px)]"
                              : "text-[clamp(10px,2.8vw,60px)] leading-[1.15]"
                          }`}
                          style={{ color: textColorTitle }}
                        >
                          {texts[0] ?? ""}
                        </span>
                        {texts[1] && (
                          <span
                            className={`font-['Heebo'] font-normal max-w-full ${
                              isModernTheme
                                ? "text-[clamp(6px,1.4vw,22px)] leading-tight"
                                : "text-[clamp(8px,2.2vw,52px)] leading-[1.1]"
                            }`}
                            style={{ color: textColorSub }}
                          >
                            {texts[1] ?? ""}
                          </span>
                        )}
                        {texts[2] && (
                          <span
                            className={`font-['Heebo'] font-normal max-w-full ${
                              isModernTheme
                                ? "text-[clamp(5px,1.2vw,18px)] leading-tight"
                                : "text-[clamp(6px,1.8vw,44px)] leading-[1.1]"
                            }`}
                            style={{ color: textColorSub }}
                          >
                            {texts[2] ?? ""}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </motion.button>
              );
            })}
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
