import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData, useRTLAnimation } from "@/shared/hooks";
import { fetchDilemmaStats } from "@/shared/lib/api";
import { formatPercent } from "@/shared/lib/utils";
import type { DilemmaStats } from "@/shared/types";
import slideStats from "@/shared/assets/slides/medical/slide-stat.png?format=webp";

const OPTION_COLORS: Record<string, string> = {
  A: "#B7ECF7",
  B: "#FCD1CF",
  C: "#C5E1A5",
  D: "#FFE082",
  E: "#B39DDB",
  F: "#80DEEA",
  G: "#EF9A9A",
  H: "#A5D6A7",
  I: "#CE93D8",
  J: "#FFCC80",
};

export function StatsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, choice } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);
  const optionCount = dilemma?.options?.length ?? 2;
  const animations = [
    useRTLAnimation({ delay: 0.1 }),
    useRTLAnimation({ delay: 0.2 }),
    useRTLAnimation({ delay: 0.3 }),
  ];

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
            <p className="mt-1 text-[clamp(12px,1.5vw,22px)] font-medium opacity-90">
              {t("stats.totalResponses", { count: stats?.total ?? 0 })}
            </p>
          </div>

          <div
            className={`absolute left-[6%] right-[6%] top-[12%] bottom-[12%] grid gap-[2.5%] ${optionCount === 3 ? "grid-cols-3" : "grid-cols-2"}`}
            style={{ direction: "ltr" }}
          >
            {dilemma.options.map((opt, idx) => {
              const color = OPTION_COLORS[opt.id] ?? "#E6F8F9";
              const anim = animations[idx] ?? animations[0];
              const percent = stats?.optionPercents?.[opt.id] ?? stats?.aPercent ?? stats?.bPercent ?? (optionCount === 2 ? 50 : 33);
              const count = stats?.optionCounts?.[opt.id] ?? 0;
              const isChosen = choice === opt.id;
              return (
                <motion.div
                  key={opt.id}
                  {...anim}
                  initial={{ ...anim.initial, scale: 0.98 }}
                  animate={{ ...anim.animate, scale: 1 }}
                  className="relative h-full w-full rounded-[28px] outline-none"
                >
                  <span className="sr-only">{opt.label}</span>
                  <div className="absolute inset-0 z-10 px-[8%] text-center">
                    <span
                      className="absolute left-1/2 top-[12%] -translate-x-1/2 font-['Heebo'] font-medium text-[clamp(12px,2.8vw,56px)] leading-[1.15] max-w-[95%] line-clamp-2"
                      style={{ color }}
                    >
                      {opt.label}
                    </span>
                    <span
                      className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 font-['Heebo'] font-black text-[clamp(22px,6vw,120px)] leading-none max-w-full"
                      style={{ color }}
                    >
                      {formatPercent(percent)}%
                    </span>
                    <span
                      className="absolute left-1/2 top-[68%] -translate-x-1/2 font-['Heebo'] font-medium text-[clamp(11px,1.4vw,20px)] opacity-90"
                      style={{ color }}
                    >
                      {t("stats.optionResponsesCount", { count })}
                    </span>
                    {isChosen && (
                      <div
                        className={`absolute bottom-[8%] flex items-center justify-center rounded-full border-2 ${idx === 1 && optionCount === 3 ? "left-1/2 -translate-x-1/2" : ""}`}
                        style={{
                          width: "clamp(100px, 8vw, 140px)",
                          height: "clamp(100px, 8vw, 140px)",
                          backgroundColor: `${color}19`,
                          borderColor: color,
                          boxShadow: `0px 0px 24px 0px ${color}`,
                          padding: "8px",
                          ...(opt.id === "A" ? { left: "8%" } : opt.id === "B" && optionCount === 2 ? { right: "8%" } : opt.id === "B" && optionCount === 3 ? { left: "50%", transform: "translate(-50%, 0)" } : { right: "8%" }),
                        }}
                      >
                        <span
                          className="font-['Heebo'] font-bold text-center leading-[1.14em] whitespace-pre-line"
                          style={{ fontSize: "clamp(14px, 1.4vw, 22px)", color }}
                        >
                          {i18n.language === "he" ? "הבחירה\nשלך" : t("stats.yourChoice")}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
