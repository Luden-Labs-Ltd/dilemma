import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useState } from "react";
import { useDilemma } from "../app/context";
import { useDilemmaData } from "@/shared/hooks";

// Конфигурация режима: "carousel" или "ai"
const EXTRA_MODE: "carousel" | "ai" = "carousel";

export function ExtraPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentDilemma, choice } = useDilemma();
  const dilemma = useDilemmaData(currentDilemma);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!currentDilemma || !choice || !dilemma) {
    navigate("/");
    return null;
  }

  const sources = dilemma.sources;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sources.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sources.length) % sources.length);
  };

  const handleContinue = () => {
    navigate("/insight");
  };

  if (EXTRA_MODE === "carousel") {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Заголовок */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center text-3xl font-bold text-gray-800"
          >
            {t("extra.title")}
          </motion.h1>

          {/* Карусель */}
          <div className="relative">
            {/* Кнопки навигации */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-all hover:bg-white hover:shadow-xl"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-all hover:bg-white hover:shadow-xl"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>

            {/* Карточки */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="mx-auto w-full max-w-2xl rounded-3xl bg-white/90 p-10 shadow-2xl backdrop-blur-sm"
              >
                {/* Иконка */}
                <div className="mb-6 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
                    <BookOpen className="h-8 w-8 text-cyan-600" />
                  </div>
                </div>

                {/* Заголовок карточки */}
                <h2 className="mb-2 text-center text-2xl font-bold text-gray-800">
                  {sources[currentIndex].title}
                </h2>
                <p className="mb-6 text-center text-sm text-gray-500">
                  {sources[currentIndex].subtitle}
                </p>

                {/* Содержание */}
                <div className="leading-relaxed text-gray-700">
                  <p>{sources[currentIndex].content}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Индикаторы */}
            <div className="mt-6 flex justify-center gap-2">
              {sources.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? "w-8 bg-cyan-500" : "w-2 bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Кнопка далее */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <button
              onClick={handleContinue}
              className="rounded-full bg-cyan-500 px-12 py-4 text-lg font-bold text-white shadow-xl transition-all hover:bg-cyan-600 hover:shadow-2xl"
            >
              {t("extra.next")}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // AI режим (заглушка)
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="w-full max-w-2xl rounded-3xl bg-white/90 p-10 shadow-2xl backdrop-blur-sm"
      >
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          {t("extra.aiTitle")}
        </h1>
        <p className="mb-8 text-center leading-relaxed text-gray-700">
          {t("extra.aiPlaceholder")}
        </p>
        <button
          onClick={handleContinue}
          className="mx-auto block rounded-full bg-cyan-500 px-10 py-3 font-bold text-white shadow-lg transition-all hover:bg-cyan-600 hover:shadow-xl"
        >
          {t("extra.next")}
        </button>
      </motion.div>
    </div>
  );
}
