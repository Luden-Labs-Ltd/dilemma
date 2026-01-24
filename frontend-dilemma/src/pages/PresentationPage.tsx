import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDilemma } from "../app/context";
import { PresentationSlide } from "@/shared/components/PresentationSlide";
import { PRESENTATIONS, DILEMMA_NAME_MAP } from "@/shared/config/presentations";
import type { PresentationConfig } from "@/shared/types/presentation";
import slide11 from "@/shared/assets/slides/medical/slide-11.png";

export function PresentationPage() {
  const navigate = useNavigate();
  const { currentDilemma } = useDilemma();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showChoiceButtons, setShowChoiceButtons] = useState(false);
  // Для слайдов 3, 4, 5 (индексы 2, 3, 4) - отслеживаем, какие должны быть видны одновременно
  const [stackedSlides, setStackedSlides] = useState<Set<number>>(new Set());

  // Маппинг имени дилемы из API к ключу презентации
  const presentationKey = currentDilemma ? (DILEMMA_NAME_MAP[currentDilemma] || currentDilemma) : undefined;
  const presentation = presentationKey ? (PRESENTATIONS[presentationKey] as PresentationConfig | undefined) : undefined;
  const slides = presentation?.slides;
  const choiceButtons = presentation?.choiceButtons;

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
    
    // Если все слайды показаны, показываем кнопки выбора
    if (currentSlideIndex >= slides.length) {
      setShowChoiceButtons(true);
    }
    
    // Для слайдов 3, 4, 5 (индексы 2, 3, 4) - добавляем в стек при переходе
    if (currentSlideIndex >= 2 && currentSlideIndex <= 4) {
      setStackedSlides((prev) => new Set(prev).add(currentSlideIndex));
    }
    
    // Очищаем стек перед слайдами 3, 4, 5 (когда переходим к слайду 2, индекс 1)
    if (currentSlideIndex === 1) {
      setStackedSlides(new Set());
    }
  }, [currentSlideIndex, slides]);

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
      // Все слайды показаны - показываем кнопки выбора
      setCurrentSlideIndex(slides.length); // Устанавливаем индекс за пределами массива
      setShowChoiceButtons(true);
    }
  };

  const handleChoice = (_choice: "a" | "b") => {
    // Сохраняем выбор и переходим к следующему шагу
    // TODO: интегрировать с контекстом
    navigate("/choice");
  };

  // Показываем кнопки выбора, если все слайды завершены
  // Также проверяем, если currentSlideIndex >= slides.length (все слайды показаны)
  if ((showChoiceButtons || currentSlideIndex >= slides.length) && choiceButtons) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-[#0b1d2b]">
        <img
          src={slide11}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* Зоны клика поверх панелей */}
        <div className="absolute left-[6%] right-[6%] top-[12%] bottom-[12%] grid grid-cols-2 gap-[2.5%]">
          <motion.button
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleChoice("a")}
            aria-label={choiceButtons.optionA.label}
            className="group relative h-full w-full rounded-[28px] outline-none transition-shadow duration-200 hover:shadow-[0_0_40px_rgba(90,210,255,0.35)] focus-visible:shadow-[0_0_40px_rgba(90,210,255,0.45)]"
          >
            <span className="sr-only">{choiceButtons.optionA.label}</span>
            <div className="absolute inset-0 rounded-[28px] ring-2 ring-cyan-300/40 group-hover:ring-cyan-300/70" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleChoice("b")}
            aria-label={choiceButtons.optionB.label}
            className="group relative h-full w-full rounded-[28px] outline-none transition-shadow duration-200 hover:shadow-[0_0_40px_rgba(255,120,120,0.35)] focus-visible:shadow-[0_0_40px_rgba(255,120,120,0.45)]"
          >
            <span className="sr-only">{choiceButtons.optionB.label}</span>
            <div className="absolute inset-0 rounded-[28px] ring-2 ring-red-300/40 group-hover:ring-red-300/70" />
          </motion.button>
        </div>
      </div>
    );
  }


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
      
      {/* Если нет видимых слайдов, показываем заглушку */}
      {visibleSlides.length === 0 && (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
          <p>Loading choice buttons...</p>
        </div>
      )}
    </div>
  );
}
