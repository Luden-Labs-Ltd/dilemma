import { useReducedMotion, type Transition } from "framer-motion";
import { useLanguage } from "./useLanguage";
import type { RTLAnimationConfig, RTLAnimationProps } from "@/shared/utils/animation";
import {
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_ANIMATION_DELAY,
  DEFAULT_ANIMATION_DISTANCE,
} from "@/shared/utils/animation";

/**
 * Hook for RTL-aware text animations
 * Returns framer-motion animation props that respect language direction and accessibility preferences
 *
 * @param config - Optional configuration to override defaults
 * @returns Animation props compatible with framer-motion motion components
 */
export function useRTLAnimation(
  config?: Partial<RTLAnimationConfig>
): RTLAnimationProps {
  const { isRTL } = useLanguage();
  const prefersReducedMotion = useReducedMotion() ?? false;

  const duration = config?.duration ?? DEFAULT_ANIMATION_DURATION;
  const delay = config?.delay ?? DEFAULT_ANIMATION_DELAY;
  const distance = config?.distance ?? DEFAULT_ANIMATION_DISTANCE;

  // If reduced motion is enabled, disable animations
  if (prefersReducedMotion) {
    return {
      initial: {
        opacity: 1,
        x: 0,
      },
      animate: {
        opacity: 1,
        x: 0,
      },
      transition: {
        duration: 0,
        delay: 0,
      } as Transition,
    };
  }

  // RTL: slide from right (positive x), LTR: slide from left (negative x)
  const initialX = isRTL ? distance : -distance;

  return {
    initial: {
      opacity: 0,
      x: initialX,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    transition: {
      duration,
      delay,
      ease: "easeOut",
    } as Transition,
  };
}
