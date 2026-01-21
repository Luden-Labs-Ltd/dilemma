import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";
import { getStats } from "@/shared/lib/api";
import { useMemo } from "react";

export function StatsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, choice } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);

  // Вычисляем статистику синхронно
  const stats = useMemo(() => {
    if (!currentDilemma) {
      return { aPercent: 50, bPercent: 50, total: 0 };
    }
    return getStats(currentDilemma);
  }, [currentDilemma]);

  if (!currentDilemma || !choice || !dilemma) {
    navigate("/");
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full max-w-2xl rounded-3xl bg-white/90 p-10 shadow-2xl backdrop-blur-sm"
      >
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {t("stats.title")}
          </h1>
          <p className="mt-2 text-gray-600">
            {t("stats.totalResponses", { count: stats.total })}
          </p>
        </div>

        {/* Горизонтальные бары */}
        <div className="mb-8 space-y-6">
          {/* Опция A */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">
                  {t("stats.optionA")}
                </span>
                {choice === "a" && (
                  <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-bold text-cyan-700">
                    {t("stats.yourChoice")}
                  </span>
                )}
              </div>
              <span className="font-bold text-gray-800">{stats.aPercent}%</span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.aPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className={`h-full rounded-full ${
                  choice === "a" ? "bg-cyan-500" : "bg-cyan-300"
                }`}
              />
            </div>
          </div>

          {/* Опция B */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">
                  {t("stats.optionB")}
                </span>
                {choice === "b" && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                    {t("stats.yourChoice")}
                  </span>
                )}
              </div>
              <span className="font-bold text-gray-800">{stats.bPercent}%</span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.bPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                className={`h-full rounded-full ${
                  choice === "b" ? "bg-purple-500" : "bg-purple-300"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Кнопка далее */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/extra")}
          className="mx-auto block rounded-full bg-cyan-500 px-10 py-3 font-bold text-white shadow-lg transition-all hover:bg-cyan-600 hover:shadow-xl"
        >
          {t("stats.next")}
        </motion.button>
      </motion.div>
    </div>
  );
}
