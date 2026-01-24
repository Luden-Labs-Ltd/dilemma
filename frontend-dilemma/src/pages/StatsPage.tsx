import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";
import { fetchDilemmaStats } from "@/shared/lib/api";
import { formatPercent } from "@/shared/lib/utils";
import type { DilemmaStats } from "@/shared/types";
import slideStats from "@/shared/assets/slides/medical/slide-stat.png";

export function StatsPage() {
  const { t } = useTranslation();
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
    setIsLoading(true);
    setError(null);

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
    // <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
    //   <motion.div
    //     initial={{ opacity: 0, scale: 0.95 }}
    //     animate={{ opacity: 1, scale: 1 }}
    //     transition={{ duration: 0.5, ease: "easeInOut" }}
    //     className="w-full max-w-2xl rounded-3xl bg-white/90 p-10 shadow-2xl backdrop-blur-sm"
    //   >
    //     {/* Заголовок */}
    //     <div className="mb-8 text-center">
    //       <h1 className="text-3xl font-bold text-gray-800">
    //         {t("stats.title")}
    //       </h1>
    //       {stats && (
    //         <p className="mt-2 text-gray-600">
    //           {t("stats.totalResponses", { count: stats.total })}
    //         </p>
    //       )}
    //       {isLoading && (
    //         <p className="mt-2 text-gray-500">{t("stats.loading")}</p>
    //       )}
    //       {error && (
    //         <p className="mt-2 text-sm text-red-500">{error}</p>
    //       )}
    //     </div>

    //     {/* Горизонтальные бары */}
    //     <div className="mb-8 space-y-6">
    //       {/* Опция A */}
    //       <div>
    //         <div className="mb-2 flex items-center justify-between">
    //           <div className="flex items-center gap-2">
    //             <span className="font-medium text-gray-700">
    //               {t("stats.optionA")}
    //             </span>
    //             {choice === "a" && (
    //               <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-bold text-cyan-700">
    //                 {t("stats.yourChoice")}
    //               </span>
    //             )}
    //           </div>
    //           <span className="font-bold text-gray-800">
    //             {formatPercent(stats ? stats.aPercent : 50)}%
    //           </span>
    //         </div>
    //         <div className="h-8 w-full overflow-hidden rounded-full bg-gray-200">
    //           <motion.div
    //             initial={{ width: 0 }}
    //             animate={{ width: `${formatPercent(stats ? stats.aPercent : 50)}%` }}
    //             transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    //             className={`h-full rounded-full ${
    //               choice === "a" ? "bg-cyan-500" : "bg-cyan-300"
    //             }`}
    //           />
    //         </div>
    //       </div>

    //       {/* Опция B */}
    //       <div>
    //         <div className="mb-2 flex items-center justify-between">
    //           <div className="flex items-center gap-2">
    //             <span className="font-medium text-gray-700">
    //               {t("stats.optionB")}
    //             </span>
    //             {choice === "b" && (
    //               <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
    //                 {t("stats.yourChoice")}
    //               </span>
    //             )}
    //           </div>
    //           <span className="font-bold text-gray-800">
    //             {formatPercent(stats ? stats.bPercent : 50)}%
    //           </span>
    //         </div>
    //         <div className="h-8 w-full overflow-hidden rounded-full bg-gray-200">
    //           <motion.div
    //             initial={{ width: 0 }}
    //             animate={{ width: `${formatPercent(stats ? stats.bPercent : 50)}%` }}
    //             transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
    //             className={`h-full rounded-full ${
    //               choice === "b" ? "bg-purple-500" : "bg-purple-300"
    //             }`}
    //           />
    //         </div>
    //       </div>
    //     </div>

    //     {/* Кнопка далее */}
    //     <motion.button
    //       initial={{ opacity: 0 }}
    //       animate={{ opacity: 1 }}
    //       transition={{ delay: 1.2 }}
    //       whileHover={{ scale: 1.05 }}
    //       whileTap={{ scale: 0.98 }}
    //       onClick={() => navigate("/extra")}
    //       className="mx-auto block rounded-full bg-cyan-500 px-10 py-3 font-bold text-white shadow-lg transition-all hover:bg-cyan-600 hover:shadow-xl"
    //     >
    //       {t("stats.next")}
    //     </motion.button>
    //   </motion.div>
    // </div>

    <div className="relative h-screen w-screen overflow-hidden bg-[#0b1d2b]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[92vw] max-w-[1280px] aspect-video">
          <img
            src={slideStats}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
          />

          <div className="absolute left-1/2 top-[6%] z-10 w-[80%] -translate-x-1/2 text-center text-[#E6F8F9]">
            <span className="text-[clamp(20px,2.6vw,34px)] font-black leading-tight">
              איך אחרים ענו?
            </span>
          </div>

          <div className="absolute left-[6%] right-[6%] top-[12%] bottom-[12%] grid grid-cols-2 gap-[2.5%]">
            <motion.button
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate("/extra")}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`group relative h-full w-full rounded-[28px] outline-none transition-shadow duration-200 hover:shadow-[0_0_40px_rgba(90,210,255,0.35)] focus-visible:shadow-[0_0_40px_rgba(90,210,255,0.45)] cursor-pointer`}
            >
              <span className="sr-only">Option A</span>
              <div
                className={`absolute inset-0 rounded-[28px] ring-2 ring-cyan-300/40 group-hover:ring-cyan-300/70`}
              />
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white">
                <span className="text-[clamp(20px,2.4vw,30px)] font-bold leading-tight whitespace-pre-line">
                  {t("stats.optionA")}: <br />
                  {formatPercent(stats ? stats.aPercent : 50)}%
                </span>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              onClick={() => navigate("/extra")}
              aria-label="Option B"
              className={`group relative h-full w-full rounded-[28px] outline-none transition-shadow duration-200 hover:shadow-[0_0_40px_rgba(255,120,120,0.35)] focus-visible:shadow-[0_0_40px_rgba(255,120,120,0.45)] cursor-pointer`}
            >
              <span className="sr-only">Option B</span>
              <div
                className={`absolute inset-0 rounded-[28px] ring-2  ring-red-300/40 group-hover:ring-red-300/70`}
              />
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white">
                <span className="text-[clamp(20px,2.4vw,30px)] font-bold leading-tight whitespace-pre-line">
                  {t("stats.optionB")}: <br />
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
