import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData, useLanguage, useRTLAnimation } from "@/shared/hooks";
import { fetchDilemmaStats } from "@/shared/lib/api";
import { formatPercent } from "@/shared/lib/utils";
import type { DilemmaStats } from "@/shared/types";
import slideStats from "@/shared/assets/slides/medical/slide-stat.png?format=webp";

export function StatsPage() {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const animation = useRTLAnimation({ delay: 0.1 });
  const animation2 = useRTLAnimation({ delay: 0.2 });
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
              {t("stats.title")}
            </span>
          </div>

          <div
            className="absolute left-[6%] right-[6%] top-[12%] bottom-[12%] grid grid-cols-2 gap-[2.5%]"
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            <motion.div
              {...animation}
              initial={{ 
                ...animation.initial,
                scale: 0.98
              }}
              animate={{ 
                ...animation.animate,
                scale: 1
              }}
              className="relative h-full w-full rounded-[28px] outline-none"
            >
              <span className="sr-only">{t("stats.optionA")}</span>
              <div className="absolute inset-0 z-10 px-[10%] text-center">
                <span
                  className="absolute left-1/2 top-[12%] -translate-x-1/2 font-['Heebo'] font-medium text-[clamp(14px,3.2vw,72px)] leading-[1.15] max-w-[90%]"
                  style={{ color: "#B7ECF7" }}
                >
                  {t("stats.optionA")}
                </span>
                <span
                  className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 font-['Heebo'] font-black text-[clamp(28px,8vw,150px)] leading-none max-w-full"
                  style={{ color: "#B7ECF7" }}
                >
                  {formatPercent(stats ? stats.aPercent : 50)}%
                </span>
                {choice === "a" && (
                  <div
                    className="absolute left-[8%] bottom-[8%] flex items-center justify-center rounded-full border-2"
                    style={{
                      width: "clamp(120px, 10vw, 160px)",
                      height: "clamp(120px, 10vw, 160px)",
                      backgroundColor: "rgba(183, 236, 247, 0.19)",
                      borderColor: "#B7ECF7",
                      boxShadow: "0px 0px 34px 0px rgba(159, 228, 253, 1)",
                      padding: "10px",
                    }}
                  >
                    <span
                      className="font-['Heebo'] font-bold text-center leading-[1.14em] whitespace-pre-line"
                      style={{
                        fontSize: "clamp(18px, 1.75vw, 28px)",
                        color: "#B7ECF7",
                      }}
                    >
                      {i18n.language === "he" ? "הבחירה\nשלך" : t("stats.yourChoice")}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              {...animation2}
              initial={{ 
                ...animation2.initial,
                scale: 0.98
              }}
              animate={{ 
                ...animation2.animate,
                scale: 1
              }}
              className="relative h-full w-full rounded-[28px] outline-none"
            >
              <span className="sr-only">{t("stats.optionB")}</span>
              <div className="absolute inset-0 z-10 px-[10%] text-center">
                <span
                  className="absolute left-1/2 top-[12%] -translate-x-1/2 font-['Heebo'] font-medium text-[clamp(14px,3.2vw,72px)] leading-[1.15] max-w-[90%]"
                  style={{ color: "#FCD1CF" }}
                >
                  {t("stats.optionB")}
                </span>
                <span
                  className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 font-['Heebo'] font-black text-[clamp(28px,8vw,150px)] leading-none max-w-full"
                  style={{ color: "#FCD1CF" }}
                >
                  {formatPercent(stats ? stats.bPercent : 50)}%
                </span>
                {choice === "b" && (
                  <div
                    className="absolute right-[8%] bottom-[8%] flex items-center justify-center rounded-full border-2"
                    style={{
                      width: "clamp(120px, 10vw, 160px)",
                      height: "clamp(120px, 10vw, 160px)",
                      backgroundColor: "rgba(252, 209, 207, 0.19)",
                      borderColor: "#FCD1CF",
                      boxShadow: "0px 0px 34px 0px rgba(252, 209, 207, 1)",
                      padding: "10px",
                    }}
                  >
                    <span
                      className="font-['Heebo'] font-bold text-center leading-[1.14em] whitespace-pre-line"
                      style={{
                        fontSize: "clamp(18px, 1.75vw, 28px)",
                        color: "#FCD1CF",
                      }}
                    >
                      {i18n.language === "he" ? "הבחירה\nשלך" : t("stats.yourChoice")}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

    </div>
  );
}
