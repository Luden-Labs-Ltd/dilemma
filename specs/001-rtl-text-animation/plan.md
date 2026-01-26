# Implementation Plan: RTL Text Animation

**Branch**: `001-rtl-text-animation` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rtl-text-animation/spec.md`

## Summary

Implement directional text animations that respect RTL/LTR language settings across all text elements in the application. Text should slide in from the right for RTL languages (Hebrew) and from the left for LTR languages (English). The implementation will use existing framer-motion library and extend the current useLanguage hook to support prefers-reduced-motion accessibility.

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2.0  
**Primary Dependencies**: framer-motion ^12.24.11, react-i18next ^16.5.3, i18next ^25.7.4  
**Storage**: N/A (client-side only feature)  
**Testing**: Jest (via Vite test setup), React Testing Library  
**Target Platform**: Web browsers (modern browsers supporting CSS prefers-reduced-motion)  
**Project Type**: Web application (frontend-only feature)  
**Performance Goals**: Animations complete within 0.5 seconds without visible stuttering or lag on standard devices  
**Constraints**: Must respect prefers-reduced-motion, must work with existing framer-motion animations, must not break existing page functionality  
**Scale/Scope**: All text elements across ~8 pages (StatsPage, ChoicePage, DilemmaSelectionPage, ReasonPage, InsightPage, VideoPage, PresentationPage, ExtraPage)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: The constitution file is focused on backend (NestJS) architecture. This is a frontend-only feature, so backend constitution gates do not apply. However, we follow frontend best practices:

- ✅ **TypeScript First**: All code in TypeScript with strict mode
- ✅ **Functional Components**: Using React functional components with hooks
- ✅ **Accessibility**: Respecting prefers-reduced-motion (WCAG compliance)
- ✅ **Performance**: Animations complete within 0.5 seconds
- ✅ **Consistency**: Uniform behavior across all pages

**Gates Status**: ✅ PASSED (frontend feature, no backend gates applicable)

## Project Structure

### Documentation (this feature)

```text
specs/001-rtl-text-animation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - N/A for frontend-only
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend-dilemma/
├── src/
│   ├── shared/
│   │   ├── hooks/
│   │   │   ├── useLanguage.ts          # Extend to support prefers-reduced-motion
│   │   │   └── useRTLAnimation.ts      # NEW: Hook for RTL-aware animations
│   │   ├── components/
│   │   │   └── AnimatedText.tsx        # NEW: Reusable animated text component
│   │   └── utils/
│   │       └── animation.ts            # NEW: Animation utilities and constants
│   ├── pages/
│   │   ├── StatsPage.tsx               # Update: Apply RTL animation
│   │   ├── ChoicePage.tsx              # Update: Apply RTL animation
│   │   ├── DilemmaSelectionPage.tsx     # Update: Apply RTL animation
│   │   ├── ReasonPage.tsx               # Update: Apply RTL animation
│   │   ├── InsightPage.tsx              # Update: Apply RTL animation
│   │   ├── VideoPage.tsx                # Update: Apply RTL animation
│   │   └── PresentationPage.tsx        # Update: Apply RTL animation (if needed)
│   └── app/
│       └── styles/
│           └── index.css                # Update: Add prefers-reduced-motion support
└── tests/
    └── shared/
        ├── hooks/
        │   └── useRTLAnimation.test.ts  # NEW: Tests for animation hook
        └── components/
            └── AnimatedText.test.tsx     # NEW: Tests for animated component
```

**Structure Decision**: Frontend-only feature. Extending existing React component structure. New reusable hook and component for RTL animations. Updates to existing pages to use new animation utilities.

## Complexity Tracking

> **No violations - standard frontend feature implementation**
