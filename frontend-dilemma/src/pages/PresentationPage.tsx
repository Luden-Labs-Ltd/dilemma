import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDilemma } from "../app/context";
import { PresentationSlide } from "@/shared/components/PresentationSlide";
import { PRESENTATIONS, DILEMMA_NAME_MAP } from "@/shared/config/presentations";
import type { PresentationConfig, SlideContent } from "@/shared/types/presentation";

export function PresentationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentDilemma } = useDilemma();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  // Для слайдов 3, 4, 5 (индексы 2, 3, 4) - отслеживаем, какие должны быть видны одновременно
  const [stackedSlides, setStackedSlides] = useState<Set<number>>(new Set());

  // Маппинг имени дилемы из API к ключу презентации
  const presentationKey = currentDilemma ? (DILEMMA_NAME_MAP[currentDilemma] || currentDilemma) : undefined;
  const presentation = presentationKey ? (PRESENTATIONS[presentationKey] as PresentationConfig | undefined) : undefined;
  
  // Применяем переводы к слайдам, заменяя хардкод на переводы
  const slides = useMemo(() => {
    if (!presentation?.slides) return undefined;
    
    const strategicSilence = t("dilemmas.medical.strategicSilence");
    const commander8200 = t("dilemmas.medical.commander8200");
    const prophetSystemLine1 = t("dilemmas.medical.prophetSystemLine1");
    const prophetSystemLine2 = t("dilemmas.medical.prophetSystemLine2");
    const aiSimulations = t("dilemmas.medical.aiSimulations");
    const conclusionUnequivocal = t("dilemmas.medical.conclusionUnequivocal");
    const ifYouPublishWarning = t("dilemmas.medical.ifYouPublishWarning");
    const panicMoreLethal = t("dilemmas.medical.panicMoreLethal");
    const ifYouStaySilent = t("dilemmas.medical.ifYouStaySilent");
    const ifYouWarn = t("dilemmas.medical.ifYouWarn");
    const machineRecommends = t("dilemmas.medical.machineRecommends");
    const aiColdEquation = t("dilemmas.medical.aiColdEquation");
    const toSave4000 = t("dilemmas.medical.toSave4000");
    const die1000WithoutKnowing = t("dilemmas.medical.1000DieWithoutKnowing");
    const doYouListenToMachine = t("dilemmas.medical.doYouListenToMachine");
    const whichSavesLives = t("dilemmas.medical.whichSavesLives");
    const whichDemandsTruth = t("dilemmas.medical.whichDemandsTruth");
    const whatIsYourCommand = t("dilemmas.medical.whatIsYourCommand");
    
    return presentation.slides.map((slide) => {
      const translatedSlide: SlideContent = { ...slide };
      
      // Заменяем в initialText
      if (slide.initialText?.text === "שתיקה אסטרטגית") {
        translatedSlide.initialText = {
          ...slide.initialText,
          text: strategicSilence,
        };
      }
      
      // Заменяем в textBlocks
      if (slide.textBlocks) {
        translatedSlide.textBlocks = slide.textBlocks.map((block) => {
          if (block.text === "שתיקה אסטרטגית") {
            return {
              ...block,
              text: strategicSilence,
            };
          }
          if (block.text === "Strategic silence") {
            return {
              ...block,
              text: strategicSilence,
            };
          }
          if (block.text === "The machine recommends:") {
            return {
              ...block,
              text: machineRecommends,
            };
          }
          if (block.text === "אתה מפקד ב-8200") {
            return {
              ...block,
              text: commander8200,
            };
          }
          if (block.text === 'מערכת "נביא" חוזה אסון המוני') {
            return {
              ...block,
              text: prophetSystemLine1,
            };
          }
          if (block.text === "בעוד 48 שעות.") {
            return {
              ...block,
              text: prophetSystemLine2,
            };
          }
          if (block.text === "הבינה המלאכותית מריצה סימולציות של תגובת קהל.") {
            return {
              ...block,
              text: aiSimulations,
            };
          }
          if (block.text === "המסקנה חד משמעית:") {
            return {
              ...block,
              text: conclusionUnequivocal,
            };
          }
          if (block.text === "אם תפרסמו אזהרה") {
            return {
              ...block,
              text: ifYouPublishWarning,
            };
          }
          if (block.text === "הבהלה תהיה קטלנית יותר מהאסון עצמו") {
            return {
              ...block,
              text: panicMoreLethal,
            };
          }
          if (block.text === "אם תשתוק ימותו 1,000 איש.") {
            return {
              ...block,
              text: ifYouStaySilent,
            };
          }
          if (block.text === "אם תזהיר, ימותו 5,000 איש בדרכים.") {
            return {
              ...block,
              text: ifYouWarn,
            };
          }
          if (block.text === "הבינה המלאכותית מציגה לך משוואה קרה:") {
            return {
              ...block,
              text: aiColdEquation,
            };
          }
          if (block.text === "כדי להציל 4,000 איש עליך לשקר לציבור ולהניח") {
            return {
              ...block,
              text: toSave4000,
            };
          }
          if (block.text === "ל1,000 איש למות מבלי שידעו מה פגע בהם.") {
            return {
              ...block,
              text: die1000WithoutKnowing,
            };
          }
          if (block.text === "האם אתה נשמע למתמטיקה של המכונה") {
            return {
              ...block,
              text: doYouListenToMachine,
            };
          }
          if (block.text === "שחוסכת בחיי אדם, או פועל לפי המוסר האנושי") {
            return {
              ...block,
              text: whichSavesLives,
            };
          }
          if (block.text === "שדורש לומר את האמת, גם אם המחיר בדם יהיה גבוה יותר?") {
            return {
              ...block,
              text: whichDemandsTruth,
            };
          }
          if (block.text === "מה הפקודה שלך?") {
            return {
              ...block,
              text: whatIsYourCommand,
            };
          }
          return block;
        });
      }
      
      return translatedSlide;
    });
  }, [presentation, t]);

  // Все хуки должны быть вызваны до условных возвратов
  useEffect(() => {
    if (!currentDilemma) {
      navigate("/");
    }
  }, [currentDilemma, navigate]);

  useEffect(() => {
    if (!presentation) {
      // Если нет презентации для этой дилемы, переходим к выбору
      navigate("/choice");
    }
  }, [presentation, navigate]);

  useEffect(() => {
    if (!slides) return;
    
    // Если все слайды показаны, переходим к выбору
    if (currentSlideIndex >= slides.length) {
      navigate("/choice");
    }
    
    // Для слайдов 3, 4, 5 (индексы 2, 3, 4) - добавляем в стек при переходе
    if (currentSlideIndex >= 2 && currentSlideIndex <= 4) {
      setStackedSlides((prev) => new Set(prev).add(currentSlideIndex));
    }
    
    // Очищаем стек перед слайдами 3, 4, 5 (когда переходим к слайду 2, индекс 1)
    if (currentSlideIndex === 1) {
      setStackedSlides(new Set());
    }
  }, [currentSlideIndex, slides, navigate]);

  // Условные возвраты после всех хуков
  if (!currentDilemma || !presentation || !slides) {
    return null;
  }

  const handleSlideComplete = () => {
    const nextIndex = currentSlideIndex + 1;
    
    // Переходим к следующему слайду
    if (nextIndex < slides.length) {
      setCurrentSlideIndex(nextIndex);
    } else {
      // Все слайды показаны - переходим к выбору
      navigate("/choice");
    }
  };


  // Определяем, какие слайды должны быть видны
  const visibleSlides: number[] = [];
  
  // Если мы на слайдах 3, 4, 5 (индексы 2, 3, 4), показываем все наложенные слайды
  if (currentSlideIndex >= 2 && currentSlideIndex <= 4) {
    // Собираем все слайды из стека (включая текущий)
    const allStacked = Array.from(stackedSlides).filter(
      (index) => index >= 2 && index <= 4
    );
    // Добавляем текущий слайд, если его еще нет
    if (!allStacked.includes(currentSlideIndex)) {
      allStacked.push(currentSlideIndex);
    }
    // Сортируем по индексу для правильного порядка наложения
    visibleSlides.push(...allStacked.sort((a, b) => a - b));
  } else {
    // Для остальных слайдов - показываем только текущий
    if (currentSlideIndex < slides.length) {
      visibleSlides.push(currentSlideIndex);
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Рендерим все видимые слайды, накладывая их друг на друга */}
      {visibleSlides.map((slideIndex, stackIndex) => (
        <div
          key={slideIndex}
          className="absolute inset-0"
          style={{ zIndex: stackIndex + 1 }}
        >
          <PresentationSlide
            slide={slides[slideIndex]}
            onComplete={
              slideIndex === currentSlideIndex ? handleSlideComplete : () => {}
            }
          />
        </div>
      ))}
      
      {/* Если нет видимых слайдов, переходим к выбору */}
      {visibleSlides.length === 0 && currentSlideIndex >= slides.length && (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
          <p>Redirecting to choice...</p>
        </div>
      )}
    </div>
  );
}
