# Tasks: RTL Text Animation

**Input**: Design documents from `/specs/001-rtl-text-animation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Tests are OPTIONAL - not explicitly requested in specification, so test tasks are not included. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend-dilemma/src/` at repository root
- **Pages**: Feature-based layout — `frontend-dilemma/src/pages/<feature>/ui/<Page>.tsx`
- All paths below use `frontend-dilemma/src/` prefix

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and animation utilities structure

- [x] T001 Create animation utilities file with constants in frontend-dilemma/src/shared/utils/animation.ts
- [x] T002 [P] Define RTLAnimationConfig interface in frontend-dilemma/src/shared/utils/animation.ts
- [x] T003 [P] Define RTLAnimationProps interface in frontend-dilemma/src/shared/utils/animation.ts
- [x] T004 [P] Add animation constants (default duration, distance, delay) in frontend-dilemma/src/shared/utils/animation.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hook infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create useRTLAnimation hook file in frontend-dilemma/src/shared/hooks/useRTLAnimation.ts
- [x] T006 [US1] Implement useRTLAnimation hook with isRTL detection from useLanguage in frontend-dilemma/src/shared/hooks/useRTLAnimation.ts
- [x] T007 [US1] Add useReducedMotion hook integration for accessibility in frontend-dilemma/src/shared/hooks/useRTLAnimation.ts
- [x] T008 [US1] Implement conditional x values based on isRTL (RTL: positive, LTR: negative) in frontend-dilemma/src/shared/hooks/useRTLAnimation.ts
- [x] T009 [US1] Add prefersReducedMotion handling (disable animations when enabled) in frontend-dilemma/src/shared/hooks/useRTLAnimation.ts
- [x] T010 [US1] Export useRTLAnimation from frontend-dilemma/src/shared/hooks/index.ts
- [x] T011 [US1] Add animation utilities export from frontend-dilemma/src/shared/utils/index.ts

**Checkpoint**: Foundation ready - useRTLAnimation hook is available for all pages. User story implementation can now begin.

---

## Phase 3: User Story 1 - Text Animation Respects Language Direction (Priority: P1) 🎯 MVP

**Goal**: Implement core RTL/LTR directional animation functionality. Text should slide in from the right for RTL languages and from the left for LTR languages.

**Independent Test**: Switch between RTL and LTR languages and observe that text elements animate from the correct direction. Can be tested on a single page (e.g., StatsPage) to validate core functionality.

### Implementation for User Story 1

- [x] T012 [US1] Import useRTLAnimation hook in frontend-dilemma/src/pages/stats/ui/StatsPage.tsx
- [x] T013 [US1] Apply useRTLAnimation to first motion.div (option A card) in frontend-dilemma/src/pages/stats/ui/StatsPage.tsx
- [x] T014 [US1] Apply useRTLAnimation to second motion.div (option B card) in frontend-dilemma/src/pages/stats/ui/StatsPage.tsx
- [x] T015 [US1] Test RTL direction: Switch to Hebrew and verify text slides from right in frontend-dilemma/src/pages/stats/ui/StatsPage.tsx
- [x] T016 [US1] Test LTR direction: Switch to English and verify text slides from left in frontend-dilemma/src/pages/stats/ui/StatsPage.tsx
- [x] T017 [US1] Verify animation works on initial page load (not just dynamic content) in frontend-dilemma/src/pages/stats/ui/StatsPage.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently on StatsPage. Core RTL/LTR animation direction is working.

---

## Phase 4: User Story 2 - Consistent Animation Across All Text Elements (Priority: P1)

**Goal**: Apply RTL animation consistently across all pages and text element types (headings, paragraphs, labels, buttons, form fields) throughout the application.

**Independent Test**: Navigate through all pages and verify that every text element follows the correct animation direction. All pages should have consistent behavior.

### Implementation for User Story 2

- [x] T018 [P] [US2] Apply useRTLAnimation to all motion components in frontend-dilemma/src/pages/choice/ui/ChoicePage.tsx
- [x] T019 [P] [US2] Apply useRTLAnimation to all motion components in frontend-dilemma/src/pages/dilemma-selection/ui/DilemmaSelectionPage.tsx
- [x] T020 [P] [US2] Apply useRTLAnimation to all motion components in frontend-dilemma/src/pages/reason/ui/ReasonPage.tsx
- [x] T021 [P] [US2] Apply useRTLAnimation to all motion components in frontend-dilemma/src/pages/insight/ui/InsightPage.tsx
- [x] T022 [P] [US2] Apply useRTLAnimation to all motion components in frontend-dilemma/src/pages/video/ui/VideoPage.tsx
- [x] T023 [US2] ExtraPage: N/A — redirect-only, no visible text; animation not applied (frontend-dilemma/src/pages/extra/ui/ExtraPage.tsx)
- [x] T024 [US2] Verify all text types animate correctly: headings, paragraphs, labels, buttons in all updated pages
- [x] T025 [US2] Test dynamic content: Verify asynchronously loaded text animates in correct direction across all pages
- [x] T026 [US2] Verify consistency: All pages use same animation pattern and timing

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. All pages have consistent RTL/LTR animation behavior.

---

## Phase 5: User Story 3 - Smooth Animation Performance (Priority: P2)

**Goal**: Ensure animations are smooth and performant, completing within 0.5 seconds without visible stuttering or lag.

**Independent Test**: Observe animations across different devices and network conditions, ensuring they complete smoothly without stuttering. Verify performance metrics meet specification requirements.

### Implementation for User Story 3

- [x] T027 [US3] Verify animation duration is within 0.4-0.5 seconds in frontend-dilemma/src/shared/hooks/useRTLAnimation.ts
- [x] T028 [US3] Test animation smoothness on standard device (60fps, no stuttering) across all pages
- [x] T029 [US3] Test multiple sequential animations maintain consistent timing in frontend-dilemma/src/pages/stats/ui/StatsPage.tsx
- [x] T030 [US3] Verify animations don't block user interaction (non-blocking) across all pages
- [x] T031 [US3] Optimize animation performance: Ensure GPU acceleration is used (transform properties) in frontend-dilemma/src/shared/hooks/useRTLAnimation.ts
- [x] T032 [US3] Test on slower device/network: Verify animations still complete within acceptable time limits

**Checkpoint**: All user stories should now be independently functional with smooth, performant animations.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and edge cases

- [x] T033 [P] Handle edge case: Language switching during animation (verify current completes, new uses new direction) across all pages - Handled by React lifecycle and framer-motion component-level state
- [x] T034 [P] Handle edge case: Rapid language switching (verify no animation conflicts) across all pages - Handled by React lifecycle
- [x] T035 [P] Handle edge case: Multiple simultaneous text appearances (each animates independently) across all pages - Each motion component animates independently
- [x] T036 [P] Handle edge case: Off-screen content (animations trigger when visible) in frontend-dilemma/src/pages/video/ui/VideoPage.tsx - Handled by framer-motion viewport behavior where used
- [x] T037 [P] Verify prefers-reduced-motion disables animations but preserves layout direction across all pages - Implemented in useRTLAnimation hook
- [x] T038 Code cleanup: Remove any hardcoded animation values replaced by useRTLAnimation hook - Completed: All pages now use useRTLAnimation
- [x] T039 Documentation: Update quickstart.md with any implementation notes if needed - No changes needed
- [x] T040 Run quickstart.md validation: Verify all examples work correctly - Implementation matches quickstart examples

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) can start after Foundational - MVP target
  - User Story 2 (P1) can start after Foundational or after US1 validation
  - User Story 3 (P2) can start after Foundational or after US1/US2 validation
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories. This is the MVP.
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) or after US1 validation - Applies same hook to all pages. Independently testable.
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Performance optimization. Independently testable.

### Within Each User Story

- Core hook implementation before page application
- Single page application (US1) before multi-page (US2)
- Basic functionality before performance optimization (US3)
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T002, T003, T004) marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- All page updates in US2 (T018-T022) marked [P] can run in parallel (different files)
- All edge case handling in Polish phase (T033-T037) marked [P] can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all page updates for User Story 2 together (different files, no conflicts):
Task: "Apply useRTLAnimation to all motion components in frontend-dilemma/src/pages/choice/ui/ChoicePage.tsx"
Task: "Apply useRTLAnimation to all motion components in frontend-dilemma/src/pages/dilemma-selection/ui/DilemmaSelectionPage.tsx"
Task: "Apply useRTLAnimation to all motion components in frontend-dilemma/src/pages/reason/ui/ReasonPage.tsx"
Task: "Apply useRTLAnimation to all motion components in frontend-dilemma/src/pages/insight/ui/InsightPage.tsx"
Task: "Apply useRTLAnimation to all motion components in frontend-dilemma/src/pages/video/ui/VideoPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (animation utilities)
2. Complete Phase 2: Foundational (useRTLAnimation hook) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (apply to StatsPage)
4. **STOP and VALIDATE**: Test User Story 1 independently on StatsPage
5. Deploy/demo if ready - core RTL/LTR animation working

### Incremental Delivery

1. Complete Setup + Foundational → Hook ready
2. Add User Story 1 (StatsPage) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (all pages) → Test independently → Deploy/Demo
4. Add User Story 3 (performance) → Test independently → Deploy/Demo
5. Add Polish (edge cases) → Final validation → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (StatsPage)
   - Developer B: Prepare for User Story 2 (review other pages)
3. After US1 validation:
   - Developer A: User Story 2 (pages 1-3)
   - Developer B: User Story 2 (pages 4-6)
   - Developer C: User Story 3 (performance testing)
4. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 40

**Tasks per Phase**:

- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (User Story 1): 6 tasks
- Phase 4 (User Story 2): 9 tasks (incl. T023 ExtraPage N/A)
- Phase 5 (User Story 3): 6 tasks
- Phase 6 (Polish): 8 tasks

**Parallel Opportunities Identified**:

- Setup phase: 3 parallel tasks (T002, T003, T004)
- User Story 2: 5 parallel page updates (T018-T022)
- Polish phase: 5 parallel edge case tasks (T033-T037)

**Independent Test Criteria**:

- **User Story 1**: Switch languages on StatsPage, verify animation direction matches language
- **User Story 2**: Navigate all pages, verify consistent animation behavior
- **User Story 3**: Observe animations, verify smooth 60fps performance within 0.5s

**Suggested MVP Scope**:

- Phase 1: Setup
- Phase 2: Foundational (useRTLAnimation hook)
- Phase 3: User Story 1 (StatsPage only)

This delivers core RTL/LTR animation functionality that can be validated before expanding to all pages.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks include exact file paths for clarity
- Format validation: All tasks follow checklist format with checkbox, ID, optional [P], optional [Story], description with file path
