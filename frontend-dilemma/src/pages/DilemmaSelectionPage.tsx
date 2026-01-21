import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { useDilemmaList } from "@/shared/hooks";
import type { DilemmaType } from "../shared/types";

export function DilemmaSelectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCurrentDilemma } = useDilemma();
  const dilemmaList = useDilemmaList();

  const handleSelectDilemma = (dilemmaId: DilemmaType) => {
    setCurrentDilemma(dilemmaId);
    navigate("/video");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <h1 className="mb-2 text-4xl font-bold text-gray-800">
          {t("dilemmaSelection.title")}
        </h1>
        <p className="text-lg text-gray-600">
          {t("dilemmaSelection.subtitle")}
        </p>
      </motion.div>

      {/* Карточки дилемм */}
      <div className="flex flex-wrap justify-center gap-6">
        {dilemmaList.map((dilemma, index) => (
          <motion.button
            key={dilemma.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, brightness: 1.2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectDilemma(dilemma.id)}
            className="group relative h-[400px] w-[280px] overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:shadow-2xl"
          >
            {/* Изображение */}
            <div className="h-full w-full bg-gradient-to-b from-cyan-100 to-cyan-200">
              {/* Placeholder для изображения */}
              <div className="flex h-3/4 items-center justify-center">
                <div className="text-6xl opacity-30">📷</div>
              </div>
            </div>

            {/* Название */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h3 className="text-xl font-bold">{dilemma.title}</h3>
            </div>

            {/* Hover эффект - осветление */}
            <div className="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
