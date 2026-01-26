# Research: RTL Text Animation

**Feature**: 001-rtl-text-animation  
**Date**: 2026-01-26

## Research Tasks

### 1. Prefers-Reduced-Motion with Framer Motion

**Task**: Research how to detect and respect prefers-reduced-motion in React with framer-motion

**Findings**:
- Framer Motion supports `useReducedMotion()` hook from `framer-motion` package
- Can also use CSS media query: `@media (prefers-reduced-motion: reduce)`
- Best practice: Check both hook and media query for maximum compatibility
- When reduced motion is enabled, should set animation duration to 0 or use instant transitions

**Decision**: Use `useReducedMotion()` hook from framer-motion for consistency with existing animation library

**Rationale**: 
- Already using framer-motion throughout the project
- Hook provides reactive state that updates if user changes system preference
- Consistent with existing animation patterns

**Alternatives Considered**:
- CSS media queries only: Less flexible, requires separate CSS handling
- Custom hook checking `window.matchMedia`: More code, framer-motion already provides this

---

### 2. RTL Animation Patterns with Framer Motion

**Task**: Research best practices for implementing RTL-aware slide animations

**Findings**:
- Framer Motion supports conditional `initial` and `animate` props based on state
- For RTL: `initial={{ x: 100 }}` → `animate={{ x: 0 }}` (slide from right)
- For LTR: `initial={{ x: -100 }}` → `animate={{ x: 0 }}` (slide from left)
- Can combine with opacity for fade-in effect: `initial={{ opacity: 0, x: ... }}`
- Should use `transition` prop for consistent timing (0.4-0.5 seconds per spec)

**Decision**: Use conditional `x` values in framer-motion `initial` prop based on `isRTL` from `useLanguage` hook

**Rationale**:
- Leverages existing framer-motion infrastructure
- Simple conditional logic based on existing `isRTL` value
- Maintains consistency with current animation patterns in codebase

**Alternatives Considered**:
- CSS animations: Would require separate CSS classes and less flexible
- Custom animation library: Unnecessary complexity when framer-motion already handles this

---

### 3. Handling Language Switching During Animations

**Task**: Research how to handle language direction changes while animations are in progress

**Findings**:
- Framer Motion animations are independent per component instance
- When language changes, React re-renders components with new props
- In-progress animations continue with their original `initial` values
- New elements that mount after language change use new `initial` values
- This naturally provides the desired behavior: current animations complete, new ones use new direction

**Decision**: Rely on React's re-render cycle and framer-motion's component-level animation state

**Rationale**:
- No special handling needed - React's component lifecycle handles this correctly
- Each animation is scoped to its component instance
- Matches the specification requirement: "complete current animation in original direction, new elements animate in new direction"

**Alternatives Considered**:
- Force-stop animations on language change: Would create jarring visual experience
- Animate direction change: Complex and not required by spec

---

### 4. Performance Optimization for Multiple Animations

**Task**: Research performance best practices for animating many text elements simultaneously

**Findings**:
- Framer Motion uses GPU acceleration by default (transform properties)
- `x` and `opacity` transforms are hardware-accelerated
- Stagger animations using `transition.delay` for sequential appearance
- Use `AnimatePresence` for exit animations if needed
- Limit concurrent animations to avoid jank (spec allows 0.5s duration)

**Decision**: Use framer-motion's built-in performance optimizations with staggered delays for sequential elements

**Rationale**:
- Framer Motion already optimizes for performance
- Stagger delays provide visual clarity without performance penalty
- 0.5 second duration is reasonable for smooth 60fps animations

**Alternatives Considered**:
- CSS animations: Less control, similar performance
- RequestAnimationFrame manual implementation: Unnecessary complexity

---

### 5. Reusable Component vs Hook Pattern

**Task**: Determine best pattern for applying RTL animations across all text elements

**Findings**:
- Current codebase uses framer-motion `motion.*` components directly in pages
- Some pages already have custom animation logic
- Creating a reusable hook provides animation config that can be applied to any `motion.*` component
- Wrapper component would require refactoring all text elements

**Decision**: Create `useRTLAnimation()` hook that returns animation config, apply to existing `motion.*` components

**Rationale**:
- Minimal refactoring required
- Consistent with existing code patterns
- Flexible - can be used with any framer-motion component
- Easier to test and maintain

**Alternatives Considered**:
- Wrapper component (`<AnimatedText>`): Would require wrapping all text, more invasive refactoring
- Direct inline logic: Less reusable, harder to maintain consistency

---

## Summary

All research tasks completed. Key decisions:
1. Use `useReducedMotion()` from framer-motion for accessibility
2. Conditional `x` values based on `isRTL` for directional animations
3. Rely on React lifecycle for language switching behavior
4. Use framer-motion's built-in performance optimizations
5. Create reusable hook pattern for consistency

No blocking technical unknowns remain.
