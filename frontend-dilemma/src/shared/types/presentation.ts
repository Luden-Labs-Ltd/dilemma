// Типы для презентации со слайдами

export interface SlideContent {
  // Фоновое изображение
  backgroundImage?: string;
  // Размытие фона (0-10, где 0 = нет размытия, 10 = максимальное)
  backgroundBlur?: number;
  // Анимированное размытие (переход от светлого к темному)
  animatedBlur?: {
    startBlur: number; // Начальное размытие (светлое)
    endBlur: number; // Конечное размытие (темное)
    delay?: number; // Задержка перед началом анимации (мс)
    duration?: number; // Длительность анимации (мс)
    // Цветной оверлей поверх блюра (для затемнения)
    overlayColor?: string; // Цвет в формате hex (например, "#0C2033")
    overlayOpacity?: number; // Прозрачность от 0 до 1 (например, 0.6 для 60%)
  };
  // Анимация появления слайда (фонового изображения)
  slideAnimation?: "fade" | "slideLTR" | "slideRTL"; // slideLTR = слева направо, slideRTL = справа налево
  // Скрыть темный фон с паттерном (для слайдов, которые должны перекрывать друг друга)
  hideBackgroundOverlay?: boolean;
  
  // Начальный текст (уже есть на слайде, будет fade out)
  initialText?: {
    text: string;
    position?: "top" | "center" | "bottom";
    fadeOutDelay?: number; // Задержка перед fade out (мс)
    fadeOutDuration?: number; // Длительность fade out (мс)
  };
  
  // Текстовые блоки (появляются последовательно)
  textBlocks?: TextBlock[];
  
  // Промежуточный слой (полупрозрачный, между фоном и overlay)
  middleLayerImage?: {
    image: string; // Путь к изображению
    opacity?: number; // Прозрачность от 0 до 1 (по умолчанию 1)
    mixBlendMode?: string; // Режим смешивания (например, "screen" для прозрачности белых областей)
    useMask?: boolean; // Использовать CSS mask для прозрачности белых областей (альтернатива mix-blend-mode)
    size?: "small" | "medium" | "large" | "full"; // Размер изображения (по умолчанию full)
    position?: "center" | "top" | "bottom"; // Позиция изображения (по умолчанию center)
  };
  
  // Overlay изображение (накладывается поверх фонового)
  overlayImage?: {
    image: string; // Путь к изображению
    // Эффект мигания (blink)
    blink?: {
      enabled: boolean; // Включить мигание
      interval?: number; // Интервал мигания (мс, по умолчанию 500)
      delay?: number; // Задержка перед началом мигания (мс)
      count?: number; // Количество миганий (по умолчанию бесконечно)
    };
    opacity?: number; // Прозрачность от 0 до 1 (по умолчанию 1)
  };
  
  // UI элементы
  uiElements?: {
    // Круглый glowing элемент в центре
    centerGlow?: boolean;
    // Таймер (если нужен)
    timer?: {
      value: string; // "47:59:59"
      position?: "center" | "top" | "bottom";
    };
    // Другие элементы
    [key: string]: unknown;
  };
  
  // Длительность показа слайда (мс)
  duration?: number;

  // Аудио-события на слайде
  audioCues?: AudioCue[];
}

export interface AudioCue {
  // Уникальный идентификатор трека (для продолжения между слайдами)
  id?: string;
  // Источник аудио
  src: string;
  // Громкость в dB (например, -6)
  volumeDb?: number;
  // Задержка старта (мс от начала слайда)
  startOffset?: number;
  // Зациклить
  loop?: boolean;
  // Останавливать при смене слайда (по умолчанию true)
  stopOnSlideChange?: boolean;
  // Остановить через N мс от начала слайда
  stopOffset?: number;
  // Остановить после завершения typewriter-анимаций на слайде
  stopAtTypewriterEnd?: boolean;
}

export interface TextBlock {
  // Текст
  text?: string;
  // Изображение (вместо или вместе с текстом)
  image?: string;
  // Якорь позиционирования (по умолчанию viewport/экран)
  anchor?: "viewport" | "middleLayerImage";
  // Позиция
  position?: "top" | "center" | "bottom";
  // Задержка появления (мс от начала слайда)
  delay?: number;
  // Длительность показа (мс)
  duration?: number;
  // Стиль
  style?: "default" | "header" | "warning" | "command";
  // Анимация появления
  animation?: "fade" | "slideRTL" | "slideLTR"; // slideRTL = справа налево (для иврита)
  // Эффект печатания (typewriter) - текст появляется посимвольно
  typewriter?: boolean;
  // Скорость печатания (мс на символ, по умолчанию 50)
  typewriterSpeed?: number;
  // Размер шрифта (базовый, будет адаптивным)
  fontSize?: number; // в px, базовый размер
  // Вес шрифта (100-900)
  fontWeight?: number; // 400 = Regular, 900 = Black
  // Цвет текста
  color?: string; // hex цвет, например "#E6F8F9"
  // Размер изображения (если используется image)
  imageSize?: number; // в px
  // Вертикальное смещение от расчетной позиции (в px, может быть отрицательным)
  verticalOffset?: number; // Кастомное смещение для точного позиционирования
}

export interface PresentationConfig {
  // ID дилемы
  dilemmaId: string;
  // Слайды
  slides: SlideContent[];
  // Кнопки выбора в конце
  choiceButtons?: {
    optionA: {
      label: string;
      image?: string;
    };
    optionB: {
      label: string;
      image?: string;
    };
  };
}
