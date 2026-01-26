# Quick Start: RTL Text Animation

**Feature**: 001-rtl-text-animation  
**Date**: 2026-01-26

## Overview

This guide helps developers quickly understand and use the RTL text animation feature in the codebase.

## Prerequisites

- Existing `useLanguage()` hook (provides `isRTL` boolean)
- `framer-motion` library (already installed)
- React 19+ with TypeScript

## Quick Usage

### 1. Using the Hook

Import and use `useRTLAnimation()` hook in any component:

```typescript
import { useRTLAnimation } from "@/shared/hooks/useRTLAnimation";
import { motion } from "framer-motion";

function MyComponent() {
  const animation = useRTLAnimation();
  
  return (
    <motion.div {...animation}>
      <h1>Animated Text</h1>
    </motion.div>
  );
}
```

### 2. Custom Animation Config

Pass custom duration, delay, or distance:

```typescript
const animation = useRTLAnimation({
  duration: 0.5,
  delay: 0.2,
  distance: 150
});
```

### 3. Applying to Existing Components

Update existing `motion.*` components:

**Before**:
```typescript
<motion.div
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
>
  Text
</motion.div>
```

**After**:
```typescript
const animation = useRTLAnimation();

<motion.div {...animation}>
  Text
</motion.div>
```

## File Locations

### New Files
- `frontend-dilemma/src/shared/hooks/useRTLAnimation.ts` - Main animation hook
- `frontend-dilemma/src/shared/utils/animation.ts` - Animation constants and utilities

### Files to Update
- `frontend-dilemma/src/shared/hooks/useLanguage.ts` - Add prefers-reduced-motion support (if needed)
- All page components in `frontend-dilemma/src/pages/` - Apply RTL animations

## Testing

### Manual Testing

1. **Test RTL Direction**:
   - Switch language to Hebrew (RTL)
   - Navigate to any page
   - Verify text slides in from right

2. **Test LTR Direction**:
   - Switch language to English (LTR)
   - Navigate to any page
   - Verify text slides in from left

3. **Test Accessibility**:
   - Enable "Reduce motion" in system settings
   - Verify animations are disabled
   - Verify text still appears with correct layout direction

4. **Test Language Switching**:
   - Start animation in one language
   - Switch language mid-animation
   - Verify current animation completes, new elements use new direction

### Automated Testing

```typescript
import { renderHook } from "@testing-library/react";
import { useRTLAnimation } from "@/shared/hooks/useRTLAnimation";

test("returns RTL animation config when isRTL is true", () => {
  // Mock useLanguage to return isRTL: true
  const { result } = renderHook(() => useRTLAnimation());
  
  expect(result.current.initial.x).toBeGreaterThan(0); // Positive for RTL
  expect(result.current.animate.x).toBe(0);
});
```

## Common Patterns

### Staggered Animations

For multiple elements appearing in sequence:

```typescript
const animation = useRTLAnimation({ delay: 0 });

{elements.map((item, index) => (
  <motion.div
    key={item.id}
    {...animation}
    transition={{ ...animation.transition, delay: index * 0.1 }}
  >
    {item.text}
  </motion.div>
))}
```

### Combining with Other Animations

```typescript
const rtlAnimation = useRTLAnimation();

<motion.div
  {...rtlAnimation}
  whileHover={{ scale: 1.05 }}
  transition={{ ...rtlAnimation.transition, type: "spring" }}
>
  Text
</motion.div>
```

## Troubleshooting

### Animation not working
- Check that `useLanguage()` hook is available and returns `isRTL`
- Verify `framer-motion` is imported correctly
- Check browser console for errors

### Wrong direction
- Verify `isRTL` value from `useLanguage()` hook
- Check that language switching updates the hook value
- Ensure component re-renders on language change

### Performance issues
- Reduce `distance` value (default 100px)
- Reduce `duration` (default 0.4s, max 0.5s per spec)
- Check for too many simultaneous animations

## Next Steps

1. Review [research.md](./research.md) for technical decisions
2. Review [data-model.md](./data-model.md) for data structures
3. See implementation tasks in `tasks.md` (created by `/speckit.tasks`)
