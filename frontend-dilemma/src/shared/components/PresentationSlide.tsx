import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type React from "react";
import { useLanguage } from "@/shared/hooks";
import type { SlideContent } from "../types/presentation";

interface PresentationSlideProps {
  slide: SlideContent;
  onComplete: () => void;
}

export function PresentationSlide({ slide, onComplete }: PresentationSlideProps) {
  const { isRTL: isCurrentLanguageRTL } = useLanguage();
  const [visibleTextBlocks, setVisibleTextBlocks] = useState<Set<number>>(new Set());
  const [hiddenTextBlocks, setHiddenTextBlocks] = useState<Set<number>>(new Set());
  const [showInitialText, setShowInitialText] = useState(true);
  const [currentBlur, setCurrentBlur] = useState(
    slide.animatedBlur ? slide.animatedBlur.startBlur : (slide.backgroundBlur || 0)
  );
  const [typewriterTexts, setTypewriterTexts] = useState<Record<number, string>>({});
  // Инициализируем overlayVisible в зависимости от настроек мигания
  const [overlayVisible, setOverlayVisible] = useState(() => {
    const hasBlink = slide.overlayImage?.blink?.enabled;
    const hasCount = slide.overlayImage?.blink?.count !== undefined;
    
    if (hasBlink && hasCount) {
      // Если мигание включено с ограниченным количеством, начинаем с невидимого
      return false;
    }
    // Иначе показываем сразу или если мигание не включено
    return !hasBlink;
  });

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Обработка анимированного блюра
    if (slide.animatedBlur) {
      const delay = slide.animatedBlur.delay || 0;
      const duration = slide.animatedBlur.duration || 2000;
      const startBlur = slide.animatedBlur.startBlur;
      const endBlur = slide.animatedBlur.endBlur;
      
      // Устанавливаем начальное значение
      setCurrentBlur(startBlur);
      
      // Запускаем анимацию после задержки (эффект вспышки - резкий переход)
      const blurTimer = setTimeout(() => {
        const startTime = Date.now();
        // Easing функция для эффекта вспышки (резкий переход)
        const easeOutCubic = (t: number): number => {
          return 1 - Math.pow(1 - t, 3);
        };
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const rawProgress = Math.min(elapsed / duration, 1);
          // Применяем easing для резкого эффекта вспышки
          const progress = easeOutCubic(rawProgress);
          const current = startBlur + (endBlur - startBlur) * progress;
          setCurrentBlur(current);
          
          if (rawProgress < 1) {
            requestAnimationFrame(animate);
          }
        };
        animate();
      }, delay);
      timers.push(blurTimer);
    }

    // Обработка начального текста (fade out)
    if (slide.initialText) {
      const fadeOutDelay = slide.initialText.fadeOutDelay || 2000;
      
      const fadeOutTimer = setTimeout(() => {
        setShowInitialText(false);
      }, fadeOutDelay);
      timers.push(fadeOutTimer);
    }

    // Обработка мигающего overlay изображения (ПЕРЕД проверкой textBlocks!)
    if (slide.overlayImage) {
      if (slide.overlayImage.blink?.enabled) {
        const delay = slide.overlayImage.blink.delay || 0;
        const interval = slide.overlayImage.blink.interval || 500;
        const blinkCount = slide.overlayImage.blink.count;
        
        const blinkTimer = setTimeout(() => {
          let blinkCounter = 0;
          
          // Если указано количество миганий, мигаем ограниченное число раз
          if (blinkCount !== undefined) {
            // Одно мигание = один полный цикл (появиться → исчезнуть)
            // Для 7 миганий нужно 14 переключений (7 раз появиться и 7 раз исчезнуть)
            const totalSwitches = blinkCount * 2;
            
            // Сразу делаем первое переключение (невидимо → видимо)
            setOverlayVisible(true);
            blinkCounter = 1;
            
            const blinkInterval = setInterval(() => {
              blinkCounter++;
              setOverlayVisible((prev) => !prev);
              
              // Останавливаем после нужного количества переключений
              if (blinkCounter >= totalSwitches) {
                clearInterval(blinkInterval);
                // Оставляем в невидимом состоянии после последнего мигания
                setOverlayVisible(false);
              }
            }, interval);
            
            timers.push(blinkInterval as unknown as ReturnType<typeof setTimeout>);
          } else {
            // Бесконечное мигание (старое поведение)
            const slideDuration = slide.duration || 5000;
            const blinkInterval = setInterval(() => {
              setOverlayVisible((prev) => !prev);
            }, interval);
            
            // Останавливаем мигание при завершении слайда
            const stopBlinkTimer = setTimeout(() => {
              clearInterval(blinkInterval);
            }, slideDuration - delay);
            
            timers.push(stopBlinkTimer);
            timers.push(blinkInterval as unknown as ReturnType<typeof setTimeout>);
          }
        }, delay);
        timers.push(blinkTimer);
      } else {
        // Если мигание не включено, показываем изображение
        setOverlayVisible(true);
      }
    }

    if (!slide.textBlocks || slide.textBlocks.length === 0) {
      // Если нет текста, просто ждем duration и завершаем
      const timer = setTimeout(() => {
        onComplete();
      }, slide.duration || 3000);
      timers.push(timer);
      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
    }

    slide.textBlocks.forEach((block, index) => {
      // Показ блока
      if (block.delay !== undefined) {
        const showTimer = setTimeout(() => {
          setVisibleTextBlocks((prev) => new Set(prev).add(index));
          
          // Запускаем эффект печатания, если включен
          if (block.typewriter && block.text) {
            const fullText = block.text;
            const speed = block.typewriterSpeed || 50;
            let charIndex = 0;
            
            // Для RTL (иврит) печатаем справа налево
            // Используем текущий язык интерфейса для определения направления
            // Это соответствует лучшим практикам локализации
            const isRTL = isCurrentLanguageRTL;
            
            const typewriterTimer = setInterval(() => {
              charIndex++;
              let displayText: string;
              
              if (isRTL) {
                // Для RTL: берем символы с конца строки (справа налево)
                // Например, для "אבג" сначала показываем "ג", потом "גב", потом "גבא"
                // Это соответствует естественному направлению чтения на иврите
                displayText = fullText.slice(-charIndex);
              } else {
                // Для LTR: обычная печать слева направо
                displayText = fullText.slice(0, charIndex);
              }
              
              setTypewriterTexts((prev) => ({
                ...prev,
                [index]: displayText,
              }));
              
              if (charIndex >= fullText.length) {
                clearInterval(typewriterTimer);
              }
            }, speed);
            
            // Сохраняем таймер для очистки
            timers.push(typewriterTimer as unknown as ReturnType<typeof setTimeout>);
          } else if (block.text) {
            // Если нет эффекта печатания, сразу показываем весь текст
            setTypewriterTexts((prev) => ({
              ...prev,
              [index]: block.text || "",
            }));
          }
        }, block.delay);
        timers.push(showTimer);
      } else {
        setVisibleTextBlocks((prev) => new Set(prev).add(index));
        
        // Запускаем эффект печатания, если включен
        if (block.typewriter && block.text) {
          const fullText = block.text;
          const speed = block.typewriterSpeed || 50;
          let charIndex = 0;
          
          // Для RTL (иврит) печатаем справа налево
          // Используем текущий язык интерфейса для определения направления
          // Это соответствует лучшим практикам локализации
          const isRTL = isCurrentLanguageRTL;
          
          const typewriterTimer = setInterval(() => {
            charIndex++;
            let displayText: string;
            
            if (isRTL) {
              // Для RTL: берем символы с конца строки (справа налево)
              // Например, для "אבג" сначала показываем "ג", потом "גב", потом "גבא"
              // Это соответствует естественному направлению чтения на иврите
              displayText = fullText.slice(-charIndex);
            } else {
              // Для LTR: обычная печать слева направо
              displayText = fullText.slice(0, charIndex);
            }
            
            setTypewriterTexts((prev) => ({
              ...prev,
              [index]: displayText,
            }));
            
            if (charIndex >= fullText.length) {
              clearInterval(typewriterTimer);
            }
          }, speed);
          
          timers.push(typewriterTimer as unknown as ReturnType<typeof setTimeout>);
        } else if (block.text) {
          setTypewriterTexts((prev) => ({
            ...prev,
            [index]: block.text || "",
          }));
        }
      }

      // Скрытие блока (если указана duration)
      if (block.duration !== undefined && block.delay !== undefined) {
        const hideTimer = setTimeout(() => {
          setVisibleTextBlocks((prev) => {
            const next = new Set(prev);
            next.delete(index);
            return next;
          });
          setHiddenTextBlocks((prev) => new Set(prev).add(index));
        }, block.delay + block.duration);
        timers.push(hideTimer);
      }
    });

    // Завершение слайда
    const completeTimer = setTimeout(() => {
      onComplete();
    }, slide.duration || 5000);
    timers.push(completeTimer);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [slide, onComplete]);

  // Используем анимированный блюр, если он задан, иначе статический
  const blurValue = slide.animatedBlur ? currentBlur : (slide.backgroundBlur || 0);
  const slideAnim = slide.slideAnimation || "fade";

  // Определяем начальные и конечные свойства для анимации слайда
  const getSlideAnimation = () => {
    switch (slideAnim) {
      case "slideLTR":
        return {
          initial: { opacity: 0, x: "-100%" },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.8 },
        };
      case "slideRTL":
        return {
          initial: { opacity: 0, x: "100%" },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.8 },
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5 },
        };
    }
  };

  const slideAnimProps = getSlideAnimation();

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Фоновое изображение */}
      {slide.backgroundImage && (
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${slide.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: blurValue > 0 ? `blur(${blurValue}px)` : "none",
          }}
          initial={slideAnimProps.initial}
          animate={slideAnimProps.animate}
          transition={slideAnimProps.transition}
        />
      )}

      {/* Цветной оверлей для затемнения (появляется вместе с анимированным блюром) */}
      {slide.animatedBlur?.overlayColor && (
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: slide.animatedBlur.overlayColor,
            opacity:
              currentBlur > slide.animatedBlur.startBlur
                ? slide.animatedBlur.overlayOpacity || 0.6
                : 0,
          }}
          transition={{ duration: 0.1 }}
        />
      )}

      {/* Промежуточный слой (полупрозрачный) */}
      {slide.middleLayerImage && (() => {
        const size = slide.middleLayerImage.size || "full";
        const position = slide.middleLayerImage.position || "center";
        
        // Определяем размеры в зависимости от размера
        const sizeStyles = {
          small: { width: "60%", maxWidth: "800px", height: "auto" },
          medium: { width: "80%", maxWidth: "1000px", height: "auto" },
          large: { width: "90%", maxWidth: "1200px", height: "auto" },
          full: { width: "100%", height: "100%" },
        };
        
        // Определяем позицию
        const positionStyles = {
          center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
          top: { top: "20%", left: "50%", transform: "translate(-50%, -50%)" },
          bottom: { bottom: "15%", left: "50%", transform: "translate(-50%, 0)" }, // Внизу, но не слишком низко
        };
        
        const isFullSize = size === "full";
        
        return (
          <motion.div
            className={`absolute z-5 ${isFullSize ? "inset-0" : ""}`}
            style={{
              ...(isFullSize
                ? {
                    backgroundImage: `url(${slide.middleLayerImage.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {
                    ...positionStyles[position],
                    width: sizeStyles[size].width,
                    maxWidth: sizeStyles[size].maxWidth,
                    height: sizeStyles[size].height,
                  }),
              opacity: slide.middleLayerImage.opacity ?? 1,
              ...(slide.middleLayerImage.useMask
                ? {
                    // Используем CSS mask для прозрачности белых областей
                    maskImage: `url(${slide.middleLayerImage.image})`,
                    maskSize: "cover",
                    maskPosition: "center",
                    maskRepeat: "no-repeat",
                    WebkitMaskImage: `url(${slide.middleLayerImage.image})`,
                    WebkitMaskSize: "cover",
                    WebkitMaskPosition: "center",
                    WebkitMaskRepeat: "no-repeat",
                    // Инвертируем: белые области станут прозрачными через маску
                    filter: "brightness(0) invert(1)",
                  }
                : {
                    ...(slide.middleLayerImage.mixBlendMode && {
                      mixBlendMode: slide.middleLayerImage.mixBlendMode as React.CSSProperties["mixBlendMode"],
                    }),
                    // Дополнительные фильтры для разных режимов смешивания
                    ...(slide.middleLayerImage.mixBlendMode === "screen" && {
                      filter: "contrast(1.2) brightness(1.1)",
                    }),
                    ...(slide.middleLayerImage.mixBlendMode === "multiply" && {
                      filter: "brightness(1.1) contrast(1.1)",
                    }),
                  }),
            }}
            initial={slideAnimProps.initial}
            animate={slideAnimProps.animate}
            transition={slideAnimProps.transition}
          >
            {!isFullSize && (
              <div className="relative">
                {/* Текстовые блоки, привязанные к middleLayerImage (например, заголовок над "кнопками").
                    Важно: рендерим ABSOLUTE над картинкой, чтобы не влиять на её высоту/позицию. */}
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ bottom: "100%", marginBottom: 24 }}
                >
                  {slide.textBlocks?.map((block, index) => {
                    if (block.anchor !== "middleLayerImage") return null;
                    if (!visibleTextBlocks.has(index) || hiddenTextBlocks.has(index)) return null;

                    const baseFontSize = block.fontSize || 80;
                    const minSize = Math.max(baseFontSize * 0.125, 10);
                    const fontSize = `clamp(${minSize}px, 3.5vw, ${baseFontSize}px)`;

                    const animation = block.animation || "fade";
                    const initialProps =
                      animation === "slideRTL"
                        ? { opacity: 0, x: 100 }
                        : animation === "slideLTR"
                        ? { opacity: 0, x: -100 }
                        : { opacity: 0, y: 20 };

                    const animateProps =
                      animation === "slideRTL" || animation === "slideLTR"
                        ? { opacity: 1, x: 0 }
                        : { opacity: 1, y: 0 };

                    const exitProps =
                      animation === "slideRTL"
                        ? { opacity: 0, x: -100 }
                        : animation === "slideLTR"
                        ? { opacity: 0, x: 100 }
                        : { opacity: 0, y: -20 };

                    return (
                      <motion.div
                        key={`middleLayerText-${index}`}
                        className="text-center"
                        style={{
                          transform: `translateY(${block.verticalOffset || 0}px)`,
                          fontFamily: "'Heebo', sans-serif",
                          fontWeight: block.fontWeight ?? 900,
                          fontSize,
                          color: block.color ?? "#E6F8F9",
                          lineHeight: "100%",
                          letterSpacing: "0%",
                          textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                          whiteSpace: "nowrap",
                          maxWidth: "95vw",
                          width: "fit-content",
                        }}
                        initial={initialProps}
                        animate={animateProps}
                        exit={exitProps}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        {block.typewriter ? (typewriterTexts[index] || "") : (block.text || "")}
                      </motion.div>
                    );
                  })}
                </div>

                <img
                  src={slide.middleLayerImage.image}
                  alt=""
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* Overlay изображение (мигающее) */}
      {slide.overlayImage && (
        <motion.div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage: `url(${slide.overlayImage.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: overlayVisible ? (slide.overlayImage.opacity ?? 1) : 0,
            // mixBlendMode только для slide-6 (красная рамка), для других overlay не используем
            ...(slide.overlayImage.image.includes("slide-6") && {
              mixBlendMode: "screen", // Делает белые области прозрачными, красная рамка остается видимой
            }),
          }}
          transition={{ duration: 0.1 }}
        />
      )}

      {/* Темный фон с паттерном (circuit-board) - показывается только если не скрыт */}
      {!slide.hideBackgroundOverlay && (
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
            opacity: 0.7,
          }}
        >
          {/* Circuit-board паттерн (можно добавить SVG паттерн позже) */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(34, 211, 238, 0.15) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      )}

      {/* Круглый glowing элемент в центре (если нужен) */}
      {slide.uiElements?.centerGlow && (
        <motion.div
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1 }}
        >
          <div className="h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        </motion.div>
      )}

      {/* Таймер (если есть) */}
      {slide.uiElements?.timer && (
        <motion.div
          className={`absolute left-1/2 -translate-x-1/2 ${
            slide.uiElements.timer.position === "top"
              ? "top-20"
              : slide.uiElements.timer.position === "bottom"
              ? "bottom-20"
              : "top-1/2 -translate-y-1/2"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="rounded-lg bg-red-500/90 px-6 py-3 text-4xl font-mono font-bold text-white shadow-lg">
            {slide.uiElements.timer.value}
          </div>
        </motion.div>
      )}

      {/* Начальный текст (fade out) */}
      {slide.initialText && (
        <motion.div
          className={`absolute left-1/2 -translate-x-1/2 z-20 ${
            slide.initialText.position === "top"
              ? "top-20"
              : slide.initialText.position === "bottom"
              ? "bottom-20"
              : "top-1/2 -translate-y-1/2"
          } text-center`}
          style={{
            fontFamily: "'Heebo', sans-serif",
            fontWeight: 900,
            // Максимально агрессивная адаптивная формула: минимум 0.625rem (10px), предпочтительно 3.5vw, максимум 5rem (80px)
            // Очень маленький минимальный размер и очень низкий коэффициент vw для максимального масштабирования
            fontSize: "clamp(0.625rem, 3.5vw, 5rem)", // Адаптивный размер: от 10px до 80px
            color: "#E6F8F9",
            lineHeight: "100%",
            letterSpacing: "0%",
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            whiteSpace: "nowrap", // Текст в одну строку, без переноса
            maxWidth: "95vw", // Максимальная ширина для очень длинных строк
            width: "fit-content", // Ширина по содержимому
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: showInitialText ? 1 : 0 }}
          transition={{
            duration: (slide.initialText.fadeOutDuration || 1000) / 1000,
            ease: "easeOut",
          }}
        >
          {slide.initialText.text}
        </motion.div>
      )}

      {/* Текстовые блоки */}
      <AnimatePresence>
        {slide.textBlocks?.map((block, index) => {
          // Блоки, привязанные к middleLayerImage, рендерим внутри middleLayerImage
          if (block.anchor === "middleLayerImage") {
            return null;
          }

          if (!visibleTextBlocks.has(index) || hiddenTextBlocks.has(index)) {
            return null;
          }

          const baseFontSize = block.fontSize || 80;
          // Максимально агрессивная адаптивная формула для всех текстовых блоков
          // Минимум 12.5% от базового размера (но не меньше 10px), предпочтительно 3.5vw, максимум базовый размер
          // Очень маленький минимальный размер и очень низкий коэффициент vw для максимального масштабирования
          const minSize = Math.max(baseFontSize * 0.125, 10); // Минимум 12.5% или 10px, что больше
          const fontSize = `clamp(${minSize}px, 3.5vw, ${baseFontSize}px)`;

          // Определяем анимацию
          const animation = block.animation || "fade";
          const initialProps =
            animation === "slideRTL"
              ? { opacity: 0, x: 100 } // Справа (для RTL)
              : animation === "slideLTR"
              ? { opacity: 0, x: -100 } // Слева
              : { opacity: 0, y: 20 }; // Fade (по умолчанию)

          const animateProps =
            animation === "slideRTL" || animation === "slideLTR"
              ? { opacity: 1, x: 0 }
              : { opacity: 1, y: 0 };

          const exitProps =
            animation === "slideRTL"
              ? { opacity: 0, x: -100 } // Уходит влево
              : animation === "slideLTR"
              ? { opacity: 0, x: 100 } // Уходит вправо
              : { opacity: 0, y: -20 };

          // Вычисляем вертикальное смещение для каждого блока
          // Если position === "center" И это единственный блок в слайде - по центру (offset = 0)
          // Если несколько блоков - они идут в столбик с вертикальным смещением
          const totalBlocks = slide.textBlocks?.length || 0;
          const calculatedOffset = (block.position === "center" && totalBlocks === 1)
            ? 0 
            : (index - Math.floor((totalBlocks - 1) / 2)) * 100; // Центрируем вокруг середины массива блоков
          
          // Добавляем кастомное смещение из конфигурации, если оно есть
          const verticalOffset = calculatedOffset + (block.verticalOffset || 0);
          
          // Если блок содержит изображение
          if (block.image) {
            const imageSize = block.imageSize || 100;
            return (
              <motion.div
                key={index}
                className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
                style={{
                  top: `calc(50% + ${verticalOffset}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                initial={initialProps}
                animate={animateProps}
                exit={exitProps}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <img
                  src={block.image}
                  alt=""
                  style={{
                    width: `${imageSize}px`,
                    height: `${imageSize}px`,
                  }}
                />
              </motion.div>
            );
          }

          return (
            <motion.div
              key={index}
              className="absolute left-1/2 -translate-x-1/2 z-20 text-center"
              style={{
                top: `calc(50% + ${verticalOffset}px)`,
                transform: "translate(-50%, -50%)",
                fontFamily: "'Heebo', sans-serif",
                fontWeight: block.fontWeight ?? 900,
                fontSize,
                color: block.color ?? "#E6F8F9",
                lineHeight: "100%",
                letterSpacing: "0%",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                whiteSpace: "nowrap", // Текст в одну строку, без переноса
                maxWidth: "95vw", // Максимальная ширина для очень длинных строк
                width: "fit-content", // Ширина по содержимому
              }}
              initial={initialProps}
              animate={animateProps}
              exit={exitProps}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {block.typewriter ? (typewriterTexts[index] || "") : (block.text || "")}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
