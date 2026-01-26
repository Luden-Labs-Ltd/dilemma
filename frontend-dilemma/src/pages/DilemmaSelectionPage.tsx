import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { hasPresentationForDilemma } from "../shared/config/presentations";
import type { DilemmaType } from "../shared/types";
import dilemmaOption1 from "../shared/assets/dilemmas/dilemma-option-1.png?format=webp";
import dilemmaOption2 from "../shared/assets/dilemmas/dilemma-option-2.png?format=webp";
import dilemmaOption3 from "../shared/assets/dilemmas/dilemma-option-3.png?format=webp";

// Маппинг изображений для карточек дилемм
// dilemma-option-3 - первая дилемма (AI врач)
// dilemma-option-1 - вторая дилемма (ворота с выбором пути)
// dilemma-option-2 - третья дилемма (толпа людей)
const DILEMMA_IMAGES = [dilemmaOption3, dilemmaOption1, dilemmaOption2];

export function DilemmaSelectionPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    dilemmas,
    isLoadingDilemmas,
    dilemmasError,
    refreshDilemmas,
    setCurrentDilemma,
  } = useDilemma();

  useEffect(() => {
    void refreshDilemmas();
  }, [refreshDilemmas]);

  const handleSelectDilemma = (dilemmaName: string) => {
    setCurrentDilemma(dilemmaName as DilemmaType);
    navigate("/presentation");
  };

  // Получаем первые 3 дилеммы для отображения
  const displayedDilemmas = useMemo(
    () => dilemmas.slice(0, 3),
    [dilemmas]
  );

  // Определяем направление текста на основе текущего языка
  const textDirection = i18n.language === "he" ? "rtl" : "ltr";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:py-12">
      {/* Заголовок */}
      <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-12 text-center"
          dir={textDirection}
        >
          <h1 className="mb-2 sm:mb-4 text-[clamp(32px,8vw,100px)] font-black leading-[1.28em] text-[#E6F8F9]">
            {t("dilemmaSelection.title")}
          </h1>
          <p className="text-[clamp(16px,3vw,40px)] font-medium leading-[1.4em] text-white">
            {t("dilemmaSelection.subtitle")}
          </p>
      </motion.div>

      {/* Карточки дилемм */}
      {isLoadingDilemmas && (
        <div className="text-center text-[clamp(18px,4vw,40px)] text-white">
          {t("dilemmaSelection.loading")}
        </div>
      )}
      {dilemmasError && (
        <div className="mb-4 text-center">
          <p className="mb-2 text-[clamp(14px,2.5vw,24px)] text-red-300">{dilemmasError}</p>
          <button
            onClick={() => void refreshDilemmas()}
            className="rounded-full bg-cyan-500 px-6 py-2 text-white hover:bg-cyan-600"
          >
            {t("dilemmaSelection.retry")}
          </button>
        </div>
      )}
      {!isLoadingDilemmas && !dilemmasError && (
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-10 sm:gap-4 md:gap-6 lg:gap-[2.5%] w-full max-w-[1400px]">
          {displayedDilemmas.length === 0 ? (
            <p className="text-[clamp(14px,2.5vw,24px)] text-white">
              {t("dilemmaSelection.noDilemmas")}
            </p>
          ) : (
            displayedDilemmas.map((dilemma, index) => {
              const imageSrc = DILEMMA_IMAGES[index] || DILEMMA_IMAGES[0];
              const hasPresentation = hasPresentationForDilemma(dilemma.name);

              return (
                <motion.button
                  key={dilemma.name}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={hasPresentation ? { scale: 0.98 } : {}}
                  onClick={() => hasPresentation && handleSelectDilemma(dilemma.name)}
                  className="group relative h-[450px] w-[90%] max-w-[350px] sm:w-[280px] md:w-[300px] lg:w-[320px] xl:w-[360px] 2xl:w-[404px] sm:max-w-[404px] overflow-hidden rounded-[4px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-all hover:shadow-[0px_8px_8px_0px_rgba(0,0,0,0.35)] cursor-pointer"
                  style={{
                    border: "clamp(6px,1.2vw,12px) solid #FFFDFD",
                  }}
                >
                  {/* Изображение */}
                  <div className="relative h-full w-full">
                    <img
                      src={imageSrc}
                      alt={t(`dilemmas.${dilemma.name}.title`)}
                      className="h-full w-full object-cover"
                    />
                    {/* Градиент для всех карточек для читаемости текста */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 85%, rgba(0, 0, 0, 1) 100%)",
                      }}
                    />
                  </div>

                  {/* Название внизу */}
                  <div className="absolute bottom-0 left-0 right-0 pb-4 sm:pb-5 md:pb-6 px-3 sm:px-4 md:px-6">
                    <div className="flex items-end justify-end gap-2" dir={textDirection}>
                      {dilemma.isCompletedByUser && (
                        <span
                          className="shrink-0 rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-medium mb-1"
                          title={t("dilemmaSelection.completed")}
                        >
                          ✓
                        </span>
                      )}
                      <h3 className="text-right text-[clamp(18px,3.5vw,40px)] font-black leading-[1.3em] text-white wrap-break-word">
                        {t(`dilemmas.${dilemma.name}.title`)}
                      </h3>
                    </div>
                  </div>

                  {/* Hover эффект */}
                  <div className="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-10" />
                </motion.button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
