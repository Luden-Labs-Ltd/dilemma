// Конфигурация презентаций для каждой дилемы
import type { PresentationConfig } from "../types/presentation";

// Импорты изображений слайдов
import backgroundGradient from "../assets/background-gradient.png?format=webp";
import slide2 from "../assets/slides/medical/slide-2.png?format=webp";
import slide5 from "../assets/slides/medical/slide-5.png?format=webp";
import slide1 from "../assets/slides/medical/slide-1.png?format=webp";
import slide3 from "../assets/slides/medical/slide-3.png?format=webp";
import slide4 from "../assets/slides/medical/slide-4.png?format=webp";
import slide7 from "../assets/slides/medical/slide-7.png?format=webp";
import slide9 from "../assets/slides/medical/slide-9.png?format=webp";
import slide10 from "../assets/slides/medical/slide-10.png?format=webp";
import slide11 from "../assets/slides/medical/slide-11.png?format=webp";
import iconSvg from "../assets/icons/icon.svg";
import bgmEvasionMain from "../assets/music/BGM_Evasion_Main.mp3";
import sfxImpactDisaster from "../assets/music/SFX_Impact_Disaster.mp3";
import sfxAlarmLoop from "../assets/music/SFX_Alarm_Loop.mp3";
import uiAiProcessing from "../assets/music/UI_AI_Processing.mp3";
// Остальные слайды будут использованы позже
// import slide3 from "../assets/slides/medical/slide-3.png?format=webp";
// import slide4 from "../assets/slides/medical/slide-4.png?format=webp";

// Маппинг имен дилем из API к ключам презентаций
const DILEMMA_NAME_MAP: Record<string, string> = {
  "trolley-problem": "medical",
  "medical": "medical",
  // Добавить другие маппинги по мере необходимости
};

export const PRESENTATIONS: Record<string, PresentationConfig> = {
  medical: {
    dilemmaId: "medical",
    slides: [
      {
        backgroundImage: backgroundGradient,
        backgroundBlur: 0,
        uiElements: {
          centerGlow: true,
        },
        audioCues: [
          {
            id: "bgm-main",
            src: bgmEvasionMain,
            volumeDb: -20,
            loop: true,
            stopOnSlideChange: false,
          },
        ],
        // Первый слайд: начальный текст "שתיקה אסטרטגית" который fade out, затем появляется "אתה מפקד ב-8200"
        initialText: {
          text: "שתיקה אסטרטגית",
          position: "center",
          fadeOutDelay: 2000, // Показываем 2 секунды
          fadeOutDuration: 1000, // Fade out за 1 секунду
        },
        textBlocks: [
          {
            text: "אתה מפקד ב-8200",
            position: "center",
            delay: 3000, // Появляется после fade out начального текста
            duration: 3000,
            style: "header",
            animation: "slideRTL", // Справа налево (RTL для иврита)
            fontSize: 80, // Базовый размер, будет адаптивным
          },
        ],
        duration: 6000,
      },
      {
        backgroundImage: backgroundGradient,
        backgroundBlur: 0,
        duration: 1000,
      },
      {
        backgroundImage: slide5,
        backgroundBlur: 0,
        slideAnimation: "slideLTR", // Выезжает слева направо
        hideBackgroundOverlay: true, // Без темного фона, чтобы слайды перекрывали друг друга
        duration: 3000,
      },
      {
        backgroundImage: slide7,
        backgroundBlur: 0,
        slideAnimation: "slideLTR", // Выезжает слева направо
        hideBackgroundOverlay: true, // Без темного фона, чтобы слайды перекрывали друг друга
        duration: 3000,
      },
      {
        backgroundImage: slide2,
        backgroundBlur: 0,
        slideAnimation: "slideLTR", // Выезжает слева направо
        hideBackgroundOverlay: true, // Без темного фона, чтобы слайды перекрывали друг друга
        // Анимированный блюр: начинается после показа слайда, переходит от светлого к темному (эффект вспышки)
        animatedBlur: {
          startBlur: 0, // Начальное размытие (без блюра)
          endBlur: 6, // Конечное размытие (умеренный блюр, чтобы картинка была видна)
          delay: 3000, // Начинается после показа слайда (3 сек)
          duration: 800, // Быстрая анимация для эффекта вспышки (0.8 сек)
          overlayColor: "#0C2033", // Цветной оверлей для затемнения
          overlayOpacity: 0.4, // Прозрачность 40% (уменьшено, чтобы картинка была видна)
        },
        textBlocks: [
          {
            text: 'מערכת "נביא" חוזה אסון המוני',
            position: "center",
            delay: 3000, // Начинается вместе с блюром
            duration: 5000,
            style: "header",
            animation: "slideRTL", // Справа налево
            typewriter: true, // Эффект печатания
            typewriterSpeed: 50, // Скорость печатания (мс на символ)
            fontSize: 80,
          },
          {
            text: "בעוד 48 שעות.",
            position: "center",
            delay: 6000, // Появляется после первой строки
            duration: 5000,
            style: "header",
            animation: "slideRTL", // Справа налево
            typewriter: true, // Эффект печатания
            typewriterSpeed: 50, // Скорость печатания (мс на символ)
            fontSize: 80,
          },
        ],
        duration: 8000, // Общая длительность слайда (3 сек показ + 2 сек блюр + 3 сек текст)
      },
      {
        backgroundImage: slide9,
        backgroundBlur: 0,
        hideBackgroundOverlay: true, // Без темного фона
        audioCues: [
          {
            src: sfxAlarmLoop,
            volumeDb: -12,
            loop: true,
            startOffset: 0,
            stopOnSlideChange: true,
          },
        ],
        // Overlay изображение с эффектом мигания (slide-10)
        overlayImage: {
          image: slide10,
          opacity: 1, // Полная непрозрачность, прозрачность задается в самом изображении
          blink: {
            enabled: true,
            interval: 500, // Мигает каждые 500мс
            delay: 0, // Начинается сразу
            count: 7, // Мигает 7 раз
          },
        },
        duration: 5000, // Длительность показа слайда
      },
      {
        backgroundImage: slide1,
        backgroundBlur: 15, // Уменьшенный блюр
        hideBackgroundOverlay: true,
        textBlocks: [
          {
            text: "הבינה המלאכותית מריצה סימולציות של תגובת קהל.",
            position: "center",
            delay: 0,
            // Не указываем duration, чтобы текст оставался видимым
            style: "header",
            animation: "slideRTL", // Справа налево
            typewriter: true, // Эффект печатания
            typewriterSpeed: 50,
            fontSize: 60,
            fontWeight: 400, // Regular
            color: "#E6F8F9", // Цвет из Figma
          },
          {
            text: "המסקנה חד משמעית:",
            position: "center",
            delay: 4000, // После первого текста
            // Не указываем duration, чтобы текст оставался видимым
            style: "header",
            animation: "slideRTL",
            typewriter: true,
            typewriterSpeed: 50,
            fontSize: 60, // 60px из Figma
            fontWeight: 400, // Regular из Figma
            color: "#E6F8F9", // Цвет из Figma
          },
          {
            image: iconSvg,
            position: "center",
            delay: 7000, // После второго текста
            // Не указываем duration, чтобы иконка оставалась видимой
            animation: "slideRTL",
            imageSize: 80,
          },
          {
            text: "אם תפרסמו אזהרה",
            position: "center",
            delay: 9000, // После иконки
            // Не указываем duration, чтобы текст оставался видимым
            style: "default",
            animation: "slideRTL",
            typewriter: true,
            typewriterSpeed: 50,
            fontSize: 80, // 80px из Figma
            fontWeight: 900, // Black из Figma
            color: "#E6F8F9", // Белый цвет для видимости на темном фоне
          },
          {
            text: "הבהלה תהיה קטלנית יותר מהאסון עצמו",
            position: "center",
            delay: 12000, // После четвертого текста
            // Не указываем duration, чтобы текст оставался видимым
            style: "default",
            animation: "slideRTL",
            typewriter: true,
            typewriterSpeed: 50,
            fontSize: 80, // 80px из Figma
            fontWeight: 900, // Black из Figma
            color: "#E6F8F9", // Белый цвет для видимости на темном фоне
          },
        ],
        duration: 18000, // Общая длительность слайда (достаточно для появления всех элементов)
      },
      {
        backgroundImage: slide4,
        backgroundBlur: 0, // Начинаем без блюра
        hideBackgroundOverlay: true,
        audioCues: [
          {
            src: sfxImpactDisaster,
            volumeDb: -3,
            startOffset: 0,
            stopOnSlideChange: true,
          },
          {
            src: uiAiProcessing,
            volumeDb: -6,
            loop: true,
            startOffset: 8000,
            stopAtTypewriterEnd: true,
          },
        ],
        // Анимированный блюр: сначала показываем слайд, затем блюрим
        animatedBlur: {
          startBlur: 0, // Начальное размытие (без блюра)
          endBlur: 15, // Конечное размытие
          delay: 2000, // Задержка перед началом блюра (2 сек показа слайда)
          duration: 1000, // Длительность анимации блюра (1 сек)
        },
        textBlocks: [
          {
            text: "The machine recommends:",
            position: "center",
            delay: 3500, // Появляется после блюра (2 сек задержка + 1 сек блюр + 0.5 сек)
            duration: 2500, // Показывается 2.5 секунды, потом исчезает
            style: "default",
            animation: "fade",
            typewriter: true,
            typewriterSpeed: 50,
            fontSize: 40,
            fontWeight: 400,
            color: "#E6F8F9",
          },
          {
            text: "שתיקה אסטרטגית",
            position: "center",
            delay: 5000, // Появляется после "The machine recommends:" (3500 + 1500)
            // Не указываем duration, чтобы текст оставался видимым
            style: "header",
            animation: "slideRTL", // Справа налево
            typewriter: true, // Эффект печатания справа налево
            typewriterSpeed: 50,
            fontSize: 80, // Самый крупный
            fontWeight: 900,
            color: "#E6F8F9",
          },
          {
            text: "אם תשתוק ימותו 1,000 איש.",
            position: "center",
            delay: 8000, // После "שתיקה אסטרטגית" (5000 + 3000)
            // Не указываем duration, чтобы текст оставался видимым
            style: "default",
            animation: "slideRTL",
            typewriter: true,
            typewriterSpeed: 50,
            fontSize: 60, // Средний размер
            fontWeight: 400,
            color: "#E6F8F9",
          },
          {
            text: "אם תזהיר, ימותו 5,000 איש בדרכים.",
            position: "center",
            delay: 11000, // После второго текста (8000 + 3000)
            // Не указываем duration, чтобы текст оставался видимым
            style: "default",
            animation: "slideRTL",
            typewriter: true,
            typewriterSpeed: 50,
            fontSize: 60, // Средний размер
            fontWeight: 400,
            color: "#E6F8F9",
          },
        ],
        duration: 18000, // Общая длительность слайда (увеличена для всех текстов)
      },
      {
        backgroundImage: slide3,
        backgroundBlur: 0,
        hideBackgroundOverlay: true,
        duration: 3000, // Задержка показа слайда
      },
      {
        backgroundImage: backgroundGradient,
        backgroundBlur: 0,
        hideBackgroundOverlay: true,
        audioCues: [
          {
            src: uiAiProcessing,
            volumeDb: -6,
            loop: true,
            startOffset: 0,
            stopAtTypewriterEnd: true,
          },
        ],
        textBlocks: [
          {
            text: "הבינה המלאכותית מציגה לך משוואה קרה:",
            position: "center",
            delay: 0,
            // Не указываем duration, чтобы текст оставался видимым
            style: "header",
            animation: "slideRTL", // Справа налево
            typewriter: true, // Эффект печатания справа налево
            typewriterSpeed: 50,
            fontSize: 60,
            fontWeight: 400,
            color: "#E6F8F9",
          },
          {
            text: "כדי להציל 4,000 איש עליך לשקר לציבור ולהניח",
            position: "center",
            delay: 4000, // После первого текста
            // Не указываем duration, чтобы текст оставался видимым
            style: "default",
            animation: "slideRTL",
            typewriter: true,
            typewriterSpeed: 50,
            fontSize: 60, // 60px из Figma
            fontWeight: 900, // Black (900) из Figma
            color: "#E6F8F9", // Цвет из Figma
          },
          {
            text: "ל1,000 איש למות מבלי שידעו מה פגע בהם.",
            position: "center",
            delay: 8000, // После второго текста
            // Не указываем duration, чтобы текст оставался видимым
            style: "default",
            animation: "slideRTL",
            typewriter: true,
            typewriterSpeed: 50,
            fontSize: 60, // 60px из Figma
            fontWeight: 900, // Black (900) из Figma
            color: "#E6F8F9", // Цвет из Figma
          },
          {
            text: "האם אתה נשמע למתמטיקה של המכונה",
            position: "center",
            delay: 12000, // После третьего текста
            // Не указываем duration, чтобы текст оставался видимым
            style: "default",
            animation: "slideRTL",
            typewriter: true,
            typewriterSpeed: 50,
            fontSize: 50,
            fontWeight: 400,
            color: "#E6F8F9",
          },
          {
            text: "שחוסכת בחיי אדם, או פועל לפי המוסר האנושי",
            position: "center",
            delay: 16000, // После четвертого текста
            // Не указываем duration, чтобы текст оставался видимым
            style: "default",
            animation: "slideRTL",
            typewriter: true,
            typewriterSpeed: 50,
            fontSize: 50,
            fontWeight: 400,
            color: "#E6F8F9",
          },
          {
            text: "שדורש לומר את האמת, גם אם המחיר בדם יהיה גבוה יותר?",
            position: "center",
            delay: 20000, // После пятого текста
            // Не указываем duration, чтобы текст оставался видимым
            style: "default",
            animation: "slideRTL",
            typewriter: true,
            typewriterSpeed: 50,
            fontSize: 50,
            fontWeight: 400,
            color: "#E6F8F9",
          },
        ],
        duration: 28000, // Общая длительность слайда (достаточно для появления всех строк)
      },
      {
        backgroundImage: backgroundGradient,
        backgroundBlur: 0,
        hideBackgroundOverlay: true,
        textBlocks: [
          {
            text: "מה הפקודה שלך?",
            position: "center",
            delay: 0,
            // Не указываем duration, чтобы текст оставался видимым
            style: "header",
            animation: "slideRTL", // Справа налево
            typewriter: true, // Эффект печатания справа налево
            typewriterSpeed: 50,
            fontSize: 70,
            fontWeight: 400,
            color: "#E6F8F9",
          },
        ],
        duration: 5000, // Длительность показа слайда
      },
      {
        backgroundImage: backgroundGradient,
        backgroundBlur: 0,
        hideBackgroundOverlay: true,
        // Промежуточный слой (slide-11) поверх фона - большое изображение
        middleLayerImage: {
          image: slide11,
          opacity: 1,
          size: "large", // Большое изображение (90% ширины, maxWidth: 1200px)
          position: "center", // По центру (картинка не уезжает вниз на адаптиве)
        },
        textBlocks: [
          {
            text: "מה הפקודה שלך?",
            anchor: "middleLayerImage", // Привязываем заголовок к картинке с выбором
            position: "top",
            delay: 0,
            // Не указываем duration, чтобы текст оставался видимым
            style: "header",
            animation: "slideRTL", // Справа налево
            typewriter: true, // Эффект печатания справа налево
            typewriterSpeed: 50,
            fontSize: 70,
            fontWeight: 400,
            color: "#E6F8F9",
            verticalOffset: 0,
          },
        ],
        duration: 5000, // Длительность показа слайда - последний слайд перед выбором
      },
    ],
    choiceButtons: {
      optionA: {
        label: "אימוץ המלצת המכונה\nשתיקה להצלת חיים",
      },
      optionB: {
        label: "פרסום אזהרה\nאמת גם במחיר דמים",
      },
    },
  },
};

// Экспортируем маппинг для использования в компонентах
export { DILEMMA_NAME_MAP };

/** Временно: дилемы без презентации не кликабельны, но с hover. */
export function hasPresentationForDilemma(dilemmaName: string): boolean {
  const key = DILEMMA_NAME_MAP[dilemmaName] ?? dilemmaName;
  const config = PRESENTATIONS[key];
  return !!(config?.slides?.length);
}
