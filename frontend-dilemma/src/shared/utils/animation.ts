/**
 * Animation utilities and types for RTL-aware text animations
 */

/**
 * Configuration object for RTL-aware animations
 * isRTL and prefersReducedMotion are automatically detected from hooks
 */
export interface RTLAnimationConfig {
  duration?: number; // Default: 0.4 seconds
  delay?: number; // Default: 0
  distance?: number; // Default: 100px (horizontal offset)
}

import type { Transition } from "framer-motion";

/**
 * Animation props returned by useRTLAnimation hook
 * Compatible with framer-motion motion component props
 */
export interface RTLAnimationProps {
  initial: {
    opacity: number;
    x: number;
  };
  animate: {
    opacity: number;
    x: number;
  };
  transition: Transition;
}

/**
 * Default animation constants
 */
export const DEFAULT_ANIMATION_DURATION = 0.4; // seconds (per SC-003: within 0.5s)
export const DEFAULT_ANIMATION_DELAY = 0; // seconds
export const DEFAULT_ANIMATION_DISTANCE = 100; // pixels (horizontal offset)
