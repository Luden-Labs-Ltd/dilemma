# Tasks: Расширение контекста для AI-фидбэка

**Input**: Design documents from `/specs/005-enhance-ai-context/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md

**Tests**: TDD approach - tests written first, then implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend-dilemma/src/modules/feedback/`
- **Tests**: `backend-dilemma/src/modules/feedback/` (co-located) and `backend-dilemma/test/`

---

## Phase 1: DTOs & Validation (Foundation)

**Purpose**: Create data structures for receiving translations from client. This phase must complete before user story implementation.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Create DilemmaOptionsDto class in `backend-dilemma/src/modules/feedback/dto/dilemma-options.dto.ts` with validation decorators for options.a and options.b
- [x] T002 [P] Create DilemmaTextDto class in `backend-dilemma/src/modules/feedback/dto/dilemma-text.dto.ts` with fields: title (required), subtitle (optional), questionText (optional), description (required), reflectionText (optional), options (required, DilemmaOptionsDto)
- [x] T003 Extend FeedbackRequestDto in `backend-dilemma/src/modules/feedback/dto/feedback-request.dto.ts` to add optional fields: dilemmaText?: DilemmaTextDto and dilemmaTextOriginal?: DilemmaTextDto with proper validation decorators

**Checkpoint**: DTOs ready - user story implementation can now begin

---

## Phase 2: User Story 1 - Отправка дополнительного языка в AI-промпт (Priority: P1) 🎯 MVP

**Goal**: Когда клиент отправляет запрос с переводом дилеммы, система включает в промпт как текст на языке пользователя (dilemmaText), так и оригинальный английский текст (dilemmaTextOriginal) для предоставления AI большего контекста.

**Independent Test**: Отправить запрос на AI-фидбэк с dilemmaText и dilemmaTextOriginal, проверить что промпт содержит текст на обоих языках. Промпт должен четко разделять основной язык пользователя и оригинальный английский текст.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Add unit test for buildPrompt with dilemmaText and dilemmaTextOriginal in `backend-dilemma/src/modules/feedback/feedback.service.spec.ts` - verify prompt includes both languages
- [x] T005 [P] [US1] Add unit test for buildPrompt with only dilemmaText (no dilemmaTextOriginal) in `backend-dilemma/src/modules/feedback/feedback.service.spec.ts` - verify fallback behavior
- [x] T006 [P] [US1] Add E2E test for POST /api/feedback/analyze with translations in `backend-dilemma/test/feedback.e2e-spec.ts` - verify enhanced prompt is sent to OpenAI

### Implementation for User Story 1

- [x] T007 [US1] Update buildPrompt method signature in `backend-dilemma/src/modules/feedback/feedback.service.ts` to accept dilemmaText?: DilemmaTextDto and dilemmaTextOriginal?: DilemmaTextDto parameters
- [x] T008 [US1] Update buildPrompt method logic in `backend-dilemma/src/modules/feedback/feedback.service.ts` to use dilemmaText when provided (instead of i18n), otherwise fallback to existing i18n logic
- [x] T009 [US1] Add logic in buildPrompt method in `backend-dilemma/src/modules/feedback/feedback.service.ts` to include original English text from dilemmaTextOriginal when provided, with clear labeling ("--- Original English Text ---")
- [x] T010 [US1] Update getFeedback method in `backend-dilemma/src/modules/feedback/feedback.service.ts` to pass dilemmaText and dilemmaTextOriginal from request to buildPrompt method
- [x] T011 [US1] Ensure prompt structure in buildPrompt method in `backend-dilemma/src/modules/feedback/feedback.service.ts` clearly separates user language text and original English text with labels

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - client can send translations and system includes both languages in AI prompt

---

## Phase 3: User Story 2 - Отправка оригинального текста в AI-промпт (Priority: P1)

**Goal**: Клиент передает оригинальный английский текст из translation.json. Система отправляет в AI-промпт оба варианта текста (перевод и оригинал), что предоставляет AI полный контекст оригинального текста.

**Independent Test**: Отправить запрос с dilemmaText и dilemmaTextOriginal, проверить что промпт содержит оригинальный английский текст для всех полей дилеммы (title, subtitle, questionText, description, reflectionText, options). Оригинальный текст должен быть четко помечен.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T012 [P] [US2] Add unit test for buildPrompt with dilemmaTextOriginal containing all fields in `backend-dilemma/src/modules/feedback/feedback.service.spec.ts` - verify all fields included in prompt
- [x] T013 [P] [US2] Add unit test for buildPrompt with partial dilemmaTextOriginal (missing optional fields) in `backend-dilemma/src/modules/feedback/feedback.service.spec.ts` - verify graceful handling
- [x] T014 [P] [US2] Add unit test for buildPrompt labeling in `backend-dilemma/src/modules/feedback/feedback.service.spec.ts` - verify "Original English text" label is present
- [x] T015 [P] [US2] Add E2E test for POST /api/feedback/analyze with complete dilemmaTextOriginal in `backend-dilemma/test/feedback.e2e-spec.ts` - verify all fields in response

### Implementation for User Story 2

- [x] T016 [US2] Enhance buildPrompt method in `backend-dilemma/src/modules/feedback/feedback.service.ts` to include all dilemmaTextOriginal fields (title, subtitle, questionText, description, reflectionText, options) when provided
- [x] T017 [US2] Add clear labeling for original English text section in buildPrompt method in `backend-dilemma/src/modules/feedback/feedback.service.ts` (e.g., "--- Original English Text ---")
- [x] T018 [US2] Implement graceful handling in buildPrompt method in `backend-dilemma/src/modules/feedback/feedback.service.ts` for missing optional fields in dilemmaTextOriginal (skip missing fields, include only available ones)
- [x] T019 [US2] Ensure prompt structure in buildPrompt method in `backend-dilemma/src/modules/feedback/feedback.service.ts` maintains existing structure while adding original text sections

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - system handles both translations and original text with proper labeling

---

## Phase 4: Validation & Error Handling

**Purpose**: Ensure proper validation of new DTOs and error handling for edge cases

- [x] T020 [P] Add validation tests for DilemmaTextDto in `backend-dilemma/src/modules/feedback/dto/dilemma-text.dto.spec.ts` - test required fields, optional fields, nested options validation
- [x] T021 [P] Add validation tests for FeedbackRequestDto with new fields in `backend-dilemma/src/modules/feedback/dto/feedback-request.dto.spec.ts` - test optional fields, nested validation
- [x] T022 Add error handling in buildPrompt method in `backend-dilemma/src/modules/feedback/feedback.service.ts` for invalid structure (e.g., options not an object) - should return validation error 400
- [x] T023 Add unit test for validation error when options is not an object in `backend-dilemma/src/modules/feedback/feedback.service.spec.ts`
- [x] T024 Add E2E test for validation error 400 when dilemmaText has invalid structure in `backend-dilemma/test/feedback.e2e-spec.ts`

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T025 [P] Update Swagger/OpenAPI documentation in `backend-dilemma/src/modules/feedback/feedback.controller.ts` to document new optional fields dilemmaText and dilemmaTextOriginal
- [x] T026 [P] Update API contract documentation in `specs/005-enhance-ai-context/contracts/README.md` if needed based on implementation
- [x] T027 Code cleanup and refactoring in `backend-dilemma/src/modules/feedback/feedback.service.ts` - ensure code follows NestJS conventions
- [x] T028 [P] Verify backward compatibility - test that existing requests without new fields still work in `backend-dilemma/test/feedback.e2e-spec.ts`
- [x] T029 [P] Add logging for enhanced prompt building in `backend-dilemma/src/modules/feedback/feedback.service.ts` - log when dilemmaText/dilemmaTextOriginal are used vs fallback
- [x] T030 Run quickstart.md validation - verify all examples from quickstart.md work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **DTOs & Validation (Phase 1)**: No dependencies - can start immediately. BLOCKS all user stories.
- **User Story 1 (Phase 2)**: Depends on Phase 1 completion (DTOs must exist)
- **User Story 2 (Phase 3)**: Depends on Phase 1 completion. Can work in parallel with US1 after Phase 1, but shares buildPrompt method so sequential recommended.
- **Validation & Error Handling (Phase 4)**: Depends on Phase 2 and Phase 3 completion
- **Polish (Phase 5)**: Depends on all previous phases

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 1 (DTOs ready) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Phase 1 (DTOs ready) - Shares buildPrompt method with US1, so sequential implementation recommended (US1 → US2)

### Within Each User Story

- Tests (T004-T006, T012-T015) MUST be written and FAIL before implementation
- DTOs (Phase 1) before service implementation
- Service implementation (buildPrompt updates) before integration
- Story complete before moving to next phase

### Parallel Opportunities

- **Phase 1**: T001 and T002 can run in parallel (different DTO files)
- **Phase 2 Tests**: T004, T005, T006 can run in parallel (different test cases)
- **Phase 3 Tests**: T012, T013, T014, T015 can run in parallel (different test cases)
- **Phase 4**: T020 and T021 can run in parallel (different test files)
- **Phase 5**: T025, T026, T028, T029 can run in parallel (different files/concerns)

---

## Parallel Example: Phase 1 (DTOs)

```bash
# Launch DTO creation in parallel:
Task: "Create DilemmaOptionsDto class in backend-dilemma/src/modules/feedback/dto/dilemma-options.dto.ts"
Task: "Create DilemmaTextDto class in backend-dilemma/src/modules/feedback/dto/dilemma-text.dto.ts"
```

---

## Parallel Example: Phase 2 Tests (User Story 1)

```bash
# Launch all tests for User Story 1 together:
Task: "Add unit test for buildPrompt with dilemmaText and dilemmaTextOriginal"
Task: "Add unit test for buildPrompt with only dilemmaText (no dilemmaTextOriginal)"
Task: "Add E2E test for POST /api/feedback/analyze with translations"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: DTOs & Validation
2. Complete Phase 2: User Story 1 (tests first, then implementation)
3. **STOP and VALIDATE**: Test User Story 1 independently - verify enhanced prompts work
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Phase 1 → DTOs ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP with enhanced context!)
3. Add User Story 2 → Test independently → Deploy/Demo (full original text support)
4. Add Validation & Error Handling → Test → Deploy
5. Add Polish → Final deployment

### Sequential Strategy (Recommended)

Since both user stories modify the same buildPrompt method:

1. Complete Phase 1: DTOs
2. Complete Phase 2: User Story 1 (tests → implementation)
3. Complete Phase 3: User Story 2 (tests → implementation, builds on US1)
4. Complete Phase 4: Validation
5. Complete Phase 5: Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [US1], [US2] labels map tasks to specific user stories for traceability
- Both user stories are P1 priority but share buildPrompt method - sequential recommended
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backward compatibility: existing requests without new fields must continue working
- All new fields are optional to maintain backward compatibility
