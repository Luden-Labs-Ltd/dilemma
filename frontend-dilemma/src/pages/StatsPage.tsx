import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";
import { fetchDilemmaStats } from "@/shared/lib/api";
import { formatPercent } from "@/shared/lib/utils";
import type { DilemmaStats } from "@/shared/types";
import slideStats from "@/shared/assets/slides/medical/slide-stat.png?format=webp";
import decorativeFrame from "@/shared/assets/decorative-frame.png?format=webp";

export function StatsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, choice } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);

  const [stats, setStats] = useState<DilemmaStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<"left" | "right" | null>(null);

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
            style={{ direction: "ltr" }}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              onClick={() => navigate("/extra")}
              onMouseEnter={() => setHoveredOption("left")}
              onMouseLeave={() => setHoveredOption(null)}
              className="relative h-full w-full rounded-[28px] outline-none cursor-pointer"
            >
              <span className="sr-only">{t("stats.optionA")}</span>
              <AnimatePresence>
                {hoveredOption === "left" && (
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
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              onClick={() => navigate("/extra")}
              onMouseEnter={() => setHoveredOption("right")}
              onMouseLeave={() => setHoveredOption(null)}
              className="relative h-full w-full rounded-[28px] outline-none cursor-pointer"
            >
              <span className="sr-only">{t("stats.optionB")}</span>
              <AnimatePresence>
                {hoveredOption === "right" && (
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
              </div>
            </motion.button>
          </div>
        </div>
      </div>

    </div>
  );
}
