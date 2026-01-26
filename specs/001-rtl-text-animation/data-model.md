# Data Model: RTL Text Animation

**Feature**: 001-rtl-text-animation  
**Date**: 2026-01-26

## Overview

This is a frontend-only feature with no persistent data model. The feature uses runtime state and configuration for animation behavior.

## Runtime State

### Animation Configuration

**Type**: TypeScript interface  
**Purpose**: Configuration object for RTL-aware animations

```typescript
interface RTLAnimationConfig {
  isRTL: boolean;
  prefersReducedMotion: boolean;
  duration?: number;        // Default: 0.4 seconds
  delay?: number;           // Default: 0
  distance?: number;        // Default: 100px (horizontal offset)
}
```

**Fields**:
- `isRTL`: Boolean indicating right-to-left language direction (from `useLanguage` hook)
- `prefersReducedMotion`: Boolean from `useReducedMotion()` hook
- `duration`: Animation duration in seconds (optional, defaults to 0.4s per SC-003)
- `delay`: Delay before animation starts in seconds (optional, defaults to 0)
- `distance`: Horizontal offset distance in pixels (optional, defaults to 100px)

**Validation Rules**:
- `duration` must be >= 0 and <= 1.0 seconds (performance constraint)
- `delay` must be >= 0
- `distance` must be >= 0

**State Transitions**:
- When `isRTL` changes: New animations use new direction, in-progress animations complete in original direction
- When `prefersReducedMotion` changes: Animations immediately respect new preference (duration → 0 if enabled)

## Hook Return Values

### useRTLAnimation Hook

**Return Type**: Object with framer-motion animation props

```typescript
interface RTLAnimationProps {
  initial: {
    opacity: number;
    x: number;
  };
  animate: {
    opacity: number;
    x: number;
  };
  transition: {
    duration: number;
    delay?: number;
    ease?: string;
  };
}
```

**Computed Values**:
- `initial.x`: `isRTL ? distance : -distance` (unless `prefersReducedMotion`, then `0`)
- `initial.opacity`: `0` (unless `prefersReducedMotion`, then `1`)
- `animate.x`: `0`
- `animate.opacity`: `1`
- `transition.duration`: `prefersReducedMotion ? 0 : duration`

## Language Direction State

**Source**: `useLanguage()` hook (existing)  
**Type**: `{ isRTL: boolean; currentLanguage: "en" | "he"; ... }`

**Relationship**: Animation config derives `isRTL` from this hook

## Accessibility State

**Source**: `useReducedMotion()` hook (from framer-motion)  
**Type**: `boolean`

**Relationship**: When `true`, animations are disabled (duration = 0, no transform)

## No Persistent Storage

This feature does not require:
- Database entities
- API contracts
- Persistent state storage
- Data synchronization

All state is:
- Runtime-only (component state)
- Derived from user preferences (language, accessibility settings)
- Ephemeral (resets on page navigation)
