import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDilemma } from "../app/context";
import { PresentationSlide } from "@/shared/components/PresentationSlide";
import { PRESENTATIONS, DILEMMA_NAME_MAP } from "@/shared/config/presentations";
import type { PresentationConfig } from "@/shared/types/presentation";

export function PresentationPage() {
  const navigate = useNavigate();
  const { currentDilemma } = useDilemma();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  // Для слайдов 3, 4, 5 (индексы 2, 3, 4) - отслеживаем, какие должны быть видны одновременно
  const [stackedSlides, setStackedSlides] = useState<Set<number>>(new Set());

  // Маппинг имени дилемы из API к ключу презентации
  const presentationKey = currentDilemma ? (DILEMMA_NAME_MAP[currentDilemma] || currentDilemma) : undefined;
  const presentation = presentationKey ? (PRESENTATIONS[presentationKey] as PresentationConfig | undefined) : undefined;
  const slides = presentation?.slides;

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
