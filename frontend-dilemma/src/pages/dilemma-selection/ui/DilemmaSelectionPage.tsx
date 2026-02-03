import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "@/entities/dilemma";
import { useRTLAnimation } from "@/shared/hooks";
import type { DilemmaType } from "@/shared/types";
import dilemmaOption1 from "@/shared/assets/dilemmas/dilemma-option-1.png?format=webp";
import dilemmaOption2 from "@/shared/assets/dilemmas/dilemma-option-2.png?format=webp";
import dilemmaOption3 from "@/shared/assets/dilemmas/dilemma-option-3.png?format=webp";
import heartIcon from "@/shared/assets/icons/heart.svg";
import bookIcon from "@/shared/assets/icons/book.svg";
import shieldIcon from "@/shared/assets/icons/shield.svg";
import fallbackIcon from "@/shared/assets/icons/icon.svg";
import logoImg from "@/shared/assets/logo.png?format=webp";

const DILEMMA_IMAGES = {
  commander: dilemmaOption3,
  doctor:  dilemmaOption2,
  teacher: dilemmaOption1,
};
/** Иконки по порядку карточек: 0 — shield, 1 — book, 2 — heart */
const DILEMMA_ICONS_BY_INDEX = {
  commander: shieldIcon,
  doctor: heartIcon,
  teacher: bookIcon,
};

export function DilemmaSelectionPage() {
  const { t, i18n } = useTranslation();
  const headerAnimation = useRTLAnimation({ duration: 0.6 });
  // Создаем анимации для карточек на верхнем уровне (максимум 3 карточки)
  const cardAnimation0 = useRTLAnimation({ duration: 0.5, delay: 0 * 0.1, distance: 200 });
  const cardAnimation1 = useRTLAnimation({ duration: 0.5, delay: 1 * 0.1, distance: 100 });
  const cardAnimation2 = useRTLAnimation({ duration: 0.5, delay: 2 * 0.1, distance: 0 });
  const cardAnimations = [cardAnimation0, cardAnimation1, cardAnimation2];
  
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


    console.log(dilemmaName, "dilemmaName");
    
    navigate("/video", {
      state: {
        selectedDilemmaName: dilemmaName,
      },
    });
  };

  // Получаем первые 3 дилеммы для отображения
  const displayedDilemmas = useMemo(
    () => dilemmas.slice(0, 3),
    [dilemmas]
  );

  // Определяем направление текста на основе текущего языка
  const textDirection = i18n.language === "he" ? "rtl" : "ltr";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-14 pb-3 sm:py-6">
      {/* Заголовок */}
      <motion.div
          {...headerAnimation}
          initial={{ 
            ...headerAnimation.initial,
            y: -20
          }}
          animate={{ 
            ...headerAnimation.animate,
            y: 0
          }}
          className="mb-4 sm:mb-6 text-center"
          dir={textDirection}
        >
          <img
            src={logoImg}
            alt=""
            aria-hidden="true"
            className="mx-auto h-auto w-[min(280px,70vw)] max-w-[320px] object-contain"
          />
          <h1 className="mb-2 sm:mb-3 text-[clamp(28px,5vw,64px)] font-black leading-[1.28em] text-[#E6F8F9]">
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
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 sm:gap-3 md:gap-4 lg:gap-[2.5%] w-full max-w-[1400px]">
          {displayedDilemmas.length === 0 ? (
            <p className="text-[clamp(14px,2.5vw,24px)] text-white">
              {t("dilemmaSelection.noDilemmas")}
            </p>
          ) : (
            displayedDilemmas.map((dilemma, index) => {
              console.log(dilemma.name);
              
              const imageSrc = DILEMMA_IMAGES[dilemma.name as keyof typeof DILEMMA_IMAGES];
              const titleIcon = DILEMMA_ICONS_BY_INDEX[dilemma.name as keyof typeof DILEMMA_ICONS_BY_INDEX] ?? fallbackIcon;
              const cardAnimation = cardAnimations[index];

              return (
                <motion.button
                  key={dilemma.name}
                  type="button"
                  {...cardAnimation}
                  initial={{ 
                    ...cardAnimation.initial,
                    scale: 0.9
                  }}
                  animate={{ 
                    ...cardAnimation.animate,
                    scale: 1
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectDilemma(dilemma.name)}
                  className="group relative h-[320px] sm:h-[340px] w-[90%] max-w-[350px] sm:w-[280px] md:w-[300px] lg:w-[320px] xl:w-[360px] 2xl:w-[404px] sm:max-w-[404px] overflow-hidden rounded-[4px] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-all hover:shadow-[0px_8px_8px_0px_rgba(0,0,0,0.35)] cursor-pointer"
                  style={{
                    border: "clamp(6px,1.2vw,12px) solid #FFFDFD",
                    opacity: 1,
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

                  {/* Затемнение карточки (иконка и заголовок поверх) */}
                  <div className="absolute inset-0 bg-black/25 pointer-events-none" aria-hidden />

                  {/* Заголовок по центру карточки */}
                  <div className="absolute inset-0 flex items-center justify-center px-4">
                    <div className="relative w-full max-w-[90%]" dir={textDirection}>
                      <div className="flex flex-col items-center justify-center gap-3">
                        <img
                          src={titleIcon}
                          alt=""
                          aria-hidden="true"
                          className="h-14 w-14 object-contain sm:h-16 sm:w-16 lg:h-[72px] lg:w-[80px] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        />
                        <h3 className="text-center text-[clamp(18px,3.5vw,40px)] font-black leading-[1.3em] text-white wrap-break-word">
                          {t(`dilemmas.${dilemma.name}.title`)}
                        </h3>
                      </div>
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
