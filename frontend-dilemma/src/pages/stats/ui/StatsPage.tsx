import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "@/entities/dilemma";
import { useDilemmaData } from "@/entities/dilemma";
import { useRTLAnimation } from "@/shared/hooks";
import { fetchDilemmaStats } from "@/shared/lib/api";
import { formatPercent } from "@/shared/lib/utils";
import type { DilemmaStats, OptionId } from "@/shared/types";
import slideStats from "@/shared/assets/slides/medical/slide-stat.png?format=webp";
import logoImg from "@/shared/assets/logo.png?format=webp";
import {
  isModernThemeDilemma,
  getModernThemeBackground,
  getModernThemeOverlayOpacity,
} from "@/shared/config/dilemma-theme";
import modernThemeChoiceFrame from "@/shared/assets/dilemmas/doctor/choice-frame.png?format=webp";
import backgroundGradient from "@/shared/assets/background-gradient.png?format=webp";

export function StatsPage() {
  const { t, i18n } = useTranslation();
  const statAnimations = [
    useRTLAnimation({ delay: 0.1 }),
    useRTLAnimation({ delay: 0.2 }),
    useRTLAnimation({ delay: 0.3 }),
  ];
  const navigate = useNavigate();
  const { currentDilemma, choice } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);

  const [stats, setStats] = useState<DilemmaStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentDilemma) {
      return;
    }

    let cancelled = false;
    
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoading(true);
        setError(null);
      }
    });

    fetchDilemmaStats(currentDilemma)
      .then((data) => {
        if (cancelled) return;
        setStats(data);
      })
      .catch(() => {
        if (cancelled) return;
        // В случае ошибки показываем дефолтные 50/50 и сообщение
        setStats({
          dilemmaId: currentDilemma,
          total: 0,
          pathCounts: {},
          optionCounts: {},
          optionPercents: {},
          aCount: 0,
          bCount: 0,
          aPercent: 50,
          bPercent: 50,
        });
        setError(t("stats.error"));
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentDilemma, t]);

  if (!currentDilemma || !choice || !dilemma) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <p className="text-gray-500">{t("stats.loading")}</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const isModernTheme = isModernThemeDilemma(currentDilemma);
  const modernBg = getModernThemeBackground(currentDilemma);
  const overlayOpacity = getModernThemeOverlayOpacity(currentDilemma);
  const options = dilemma.options;
  const isThreeCards = options.length === 3;

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
      <div className="absolute top-20 left-0 right-0 bottom-0 z-20 flex flex-col items-center justify-center">
        <div className="relative w-[76vw] max-w-[1080px] aspect-video shrink-0">
          {!isModernTheme && (
            <img
              src={slideStats}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
            />
          )}

          <div className="absolute left-1/2 top-[-3%] z-10 w-[80%] -translate-x-1/2 text-center text-[#E6F8F9]">
            <span className="text-[clamp(16px,2.2vw,56px)] xl:text-[clamp(20px,2vw,64px)] font-black leading-tight">
              {t("stats.title")}
            </span>
          </div>

          <div
            className={`absolute grid ${
              isThreeCards
                ? "left-[6%] right-[6%] top-1/2 -translate-y-1/2 aspect-[3/1] h-auto md:left-[1%] md:right-[1%] lg:left-[0.5%] lg:right-[0.5%] xl:left-0 xl:right-0 grid-cols-3 gap-[2.5%] md:gap-[0.75%] lg:gap-[0.5%] xl:gap-[0.25%]"
                : "left-[6%] right-[6%] top-[12%] bottom-[12%] md:left-[1%] md:right-[1%] md:top-[5%] md:bottom-[5%] lg:left-[0.5%] lg:right-[0.5%] lg:top-[3%] lg:bottom-[4%] xl:left-0 xl:right-0 xl:top-[2%] xl:bottom-[3%] grid-cols-2 gap-[2.5%] md:gap-[0.75%] lg:gap-[0.5%] xl:gap-[0.25%]"
            }`}
            style={{ direction: "ltr" }}
          >
            {options.map((option, index) => {
              const anim = statAnimations[index] ?? statAnimations[0];
              const optionId = option.id as OptionId;
              const percent =
                optionId === "a"
                  ? (stats?.aPercent ?? 50)
                  : optionId === "b"
                    ? (stats?.bPercent ?? 50)
                    : (stats?.cPercent ?? 33);
              const isYourChoice =
                (optionId === "a" && choice === "A") ||
                (optionId === "b" && choice === "B") ||
                (optionId === "c" && choice === "B");
              const mirrorFrame = !isThreeCards && index === 1;
              const isRightColor = !isThreeCards && index === 1;
              const labelColor = isModernTheme
                ? "#E6F8F9"
                : isRightColor
                  ? "#FCD1CF"
                  : "#B7ECF7";
              const dilemmaBadgeColor = "#9FE4FD";
              const badgeStyle = isThreeCards || isModernTheme
                ? {
                    backgroundColor: "rgba(159, 228, 253, 0.19)",
                    borderColor: dilemmaBadgeColor,
                    boxShadow: `0px 0px 34px 0px ${dilemmaBadgeColor}`,
                  }
                : optionId === "a"
                  ? {
                      backgroundColor: "rgba(183, 236, 247, 0.19)",
                      borderColor: "#B7ECF7",
                      boxShadow: "0px 0px 34px 0px rgba(159, 228, 253, 1)",
                    }
                  : {
                      backgroundColor: "rgba(252, 209, 207, 0.19)",
                      borderColor: "#FCD1CF",
                      boxShadow: "0px 0px 34px 0px rgba(252, 209, 207, 1)",
                    };
              const badgeColor = isThreeCards || isModernTheme
                ? dilemmaBadgeColor
                : optionId === "a"
                  ? "#B7ECF7"
                  : "#FCD1CF";

              return (
                <motion.div
                  key={option.id}
                  {...anim}
                  initial={{ ...anim.initial, scale: 0.98 }}
                  animate={{ ...anim.animate, scale: 1 }}
                  className="relative h-full w-full rounded-[28px] outline-none"
                >
                  {isModernTheme && (
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
                  )}
                  <span className="sr-only">{option.label}</span>
                  <div
                    className={`absolute inset-0 z-10 flex flex-col items-center px-[8%] text-center ${
                      isThreeCards || isModernTheme
                        ? "justify-center gap-3"
                        : "justify-center"
                    }`}
                  >
                    <span
                      className={`font-['Heebo'] font-medium leading-tight max-w-full whitespace-pre-line ${
                        isThreeCards
                          ? "text-[clamp(11px,1.7vw,26px)] xl:text-[clamp(14px,1.5vw,32px)] 2xl:text-[clamp(16px,1.4vw,36px)] line-clamp-3 min-h-0 shrink-0"
                          : isModernTheme
                            ? "text-[clamp(10px,1.6vw,24px)] xl:text-[clamp(12px,1.4vw,36px)] leading-snug shrink-0"
                            : "absolute left-1/2 top-[12%] -translate-x-1/2 text-[clamp(14px,3.2vw,72px)] xl:text-[clamp(18px,2.8vw,88px)] leading-[1.15] max-w-[90%]"
                      } ${isModernTheme ? "text-[#E6F8F9]" : ""}`}
                      style={!isModernTheme ? { color: labelColor } : undefined}
                    >
                      {isThreeCards
                        ? option.label
                        : isModernTheme
                          ? option.label
                          : index === 0
                            ? t("stats.optionA")
                            : t("stats.optionB")}
                    </span>
                    <span
                      className={`font-['Heebo'] font-black leading-none max-w-full shrink-0 ${
                        isThreeCards
                          ? "text-[clamp(22px,5vw,72px)] xl:text-[clamp(26px,4.5vw,88px)] 2xl:text-[clamp(30px,4vw,100px)]"
                          : isModernTheme
                            ? "text-[clamp(24px,6vw,100px)] xl:text-[clamp(28px,5vw,120px)]"
                            : "absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 text-[clamp(28px,8vw,150px)] xl:text-[clamp(34px,7vw,180px)]"
                      } ${isThreeCards ? "text-[#B7ECF7]" : isModernTheme ? "text-[#E6F8F9]" : ""}`}
                      style={!isModernTheme && !isThreeCards ? { color: labelColor } : undefined}
                    >
                      {formatPercent(percent)}%
                    </span>
                    {isYourChoice && (
                      <div
                        className={`absolute flex min-w-0 shrink-0 items-center justify-center rounded-full border-2 ${
                          isThreeCards || isModernTheme
                            ? "h-10 w-10 p-1 sm:h-12 sm:w-12 md:h-14 md:w-14"
                            : "h-10 w-10 p-1 sm:h-14 sm:w-14 sm:p-1.5 md:h-20 md:w-20 md:p-2 lg:h-28 lg:w-28 lg:p-3"
                        } ${
                          index === 0
                            ? "left-[2%] bottom-[2%] sm:left-[4%] sm:bottom-[4%] md:left-[6%] md:bottom-[6%]"
                            : "right-[2%] bottom-[2%] sm:right-[4%] sm:bottom-[4%] md:right-[6%] md:bottom-[6%]"
                        }`}
                        style={badgeStyle}
                      >
                        <span
                          className={`font-['Heebo'] text-center font-bold leading-tight whitespace-pre-line wrap-break-word ${
                            isThreeCards || isModernTheme
                              ? "text-[7px] sm:text-[8px] md:text-[10px] xl:text-[12px] 2xl:text-[14px] px-0.5"
                              : "text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl"
                          }`}
                          style={{ color: badgeColor }}
                        >
                          {i18n.language === "he"
                            ? "הבחירה\nשלך"
                            : t("stats.yourChoice")}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/video-end")}
          className="mt-6 shrink-0 rounded-[4px] bg-[#E4FFFF] px-10 py-3 font-bold text-black shadow-lg transition-all hover:bg-[#BAEDF0] hover:shadow-xl"
        >
          {t("stats.next")}
        </motion.button>
      </div>
    </div>
  );
}
