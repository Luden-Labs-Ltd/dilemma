import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play, SkipForward } from "lucide-react";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";
import { useEffect, useState } from "react";

export function VideoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!currentDilemma) {
      navigate("/");
    }
  }, [currentDilemma, navigate]);

  if (!currentDilemma || !dilemma) {
    return null;
  }

  const handlePlay = () => {
    setIsPlaying(true);
    // Имитация окончания видео через 5 секунд
    setTimeout(() => {
      navigate("/choice");
    }, 5000);
  };

  const handleSkip = () => {
    navigate("/choice");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full max-w-4xl"
      >
        {/* Заголовок */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-center text-3xl font-bold text-gray-800"
        >
          {dilemma.subtitle}
        </motion.h1>

        {/* Видео-заглушка */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative mb-6 aspect-video w-full overflow-hidden rounded-3xl bg-gray-900 shadow-2xl"
        >
          {/* Placeholder для видео */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            {!isPlaying ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlay}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg transition-all hover:bg-cyan-600"
              >
                <Play className="ml-1 h-12 w-12" fill="white" />
              </motion.button>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                <p className="text-lg text-white/80">{t("video.playing")}</p>
              </div>
            )}
          </div>

          {/* Кнопка пропуска */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={handleSkip}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
          >
            <span>{t("video.skip")}</span>
            <SkipForward className="h-4 w-4" />
          </motion.button>
        </motion.div>

        {/* Описание */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur-sm"
        >
          <p className="text-center leading-relaxed text-gray-700">
            {dilemma.description}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
