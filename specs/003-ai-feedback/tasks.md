# Tasks: Модуль AI-фидбэка для дилем

**Input**: Design documents from `/specs/003-ai-feedback/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD mandatory per Constitution - tests written first, then implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend module**: `backend-dilemma/src/modules/feedback/`
- **DTOs**: `backend-dilemma/src/modules/feedback/dto/`
- **Tests**: `backend-dilemma/src/modules/feedback/` (co-located with `*.spec.ts`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and module structure

- [x] T001 Install OpenAI SDK package in backend-dilemma/package.json
- [x] T002 [P] Create feedback module directory structure at backend-dilemma/src/modules/feedback/
- [x] T003 [P] Add environment variables documentation for OPENAI_API_KEY and OPENAI_ASSISTANT_ID

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create FeedbackModule in backend-dilemma/src/modules/feedback/feedback.module.ts with DilemmasModule import
- [x] T005 [P] Create FeedbackService skeleton in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T006 [P] Create FeedbackController skeleton in backend-dilemma/src/modules/feedback/feedback.controller.ts
- [x] T007 [P] Create FeedbackRequestDto in backend-dilemma/src/modules/feedback/dto/feedback-request.dto.ts
- [x] T008 [P] Create FeedbackResponseDto in backend-dilemma/src/modules/feedback/dto/feedback-response.dto.ts
- [x] T009 Register FeedbackModule in backend-dilemma/src/app.module.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Получение AI-фидбэка на выбор дилемы (Priority: P1) 🎯 MVP

**Goal**: Пользователь отправляет запрос с дилеммой, выбором и размышлениями, получает массив контраргументов от AI

**Independent Test**: POST /api/feedback/analyze with valid data returns 200 with counterArguments array. Can be tested independently via API endpoint.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T010 [P] [US1] Write unit test for FeedbackService.getFeedback() with mocked OpenAI client in backend-dilemma/src/modules/feedback/feedback.service.spec.ts
- [x] T011 [P] [US1] Write E2E test for POST /api/feedback/analyze endpoint in backend-dilemma/test/feedback.e2e-spec.ts

### Implementation for User Story 1

- [x] T012 [US1] Initialize OpenAI client in FeedbackService constructor using ConfigService in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T013 [US1] Implement buildPrompt() method to construct prompt from dilemma, choice, and reasoning in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T014 [US1] Implement createThreadAndRun() method to create OpenAI thread, add message, and create run in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T015 [US1] Implement waitForCompletion() method with 60-second timeout in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T016 [US1] Implement extractResponse() method to get assistant messages from thread in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T017 [US1] Implement getFeedback() method orchestrating OpenAI workflow in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T018 [US1] Implement analyze() endpoint handler in FeedbackController calling FeedbackService in backend-dilemma/src/modules/feedback/feedback.controller.ts
- [x] T019 [US1] Add Swagger documentation for POST /api/feedback/analyze endpoint in backend-dilemma/src/modules/feedback/feedback.controller.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Валидация входных данных (Priority: P1)

**Goal**: Система валидирует все входные данные перед отправкой к AI, возвращает ошибки валидации до обращения к AI

**Independent Test**: POST /api/feedback/analyze with invalid data (invalid choice, long reasoning, non-existent dilemma) returns appropriate validation errors (400/404) without calling AI.

### Tests for User Story 2 ⚠️

- [x] T020 [P] [US2] Write unit test for FeedbackRequestDto validation (invalid choice, reasoning too long) in backend-dilemma/src/modules/feedback/dto/feedback-request.dto.spec.ts
- [x] T021 [P] [US2] Write E2E test for validation errors (400 for invalid choice, 400 for reasoning > 5000 chars, 404 for non-existent dilemma) in backend-dilemma/test/feedback.e2e-spec.ts

### Implementation for User Story 2

- [x] T022 [US2] Add validation decorators to FeedbackRequestDto (IsString, IsNotEmpty, IsIn, IsOptional, MaxLength) in backend-dilemma/src/modules/feedback/dto/feedback-request.dto.ts
- [x] T023 [US2] Integrate DilemmasService in FeedbackService to validate dilemma existence in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T024 [US2] Add dilemma active status check in FeedbackService.getFeedback() in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T025 [US2] Add ValidationPipe to FeedbackController analyze() endpoint in backend-dilemma/src/modules/feedback/feedback.controller.ts
- [x] T026 [US2] Add error handling for NotFoundException (404) when dilemma not found in backend-dilemma/src/modules/feedback/feedback.controller.ts
- [x] T027 [US2] Add error handling for BadRequestException (400) for validation errors in backend-dilemma/src/modules/feedback/feedback.controller.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Обработка ответа AI и форматирование (Priority: P1)

**Goal**: Система корректно обрабатывает ответ от AI, извлекает JSON-массив строк, валидирует формат и возвращает пользователю

**Independent Test**: Mocked AI responses (markdown code blocks, direct JSON, invalid format) are correctly parsed and validated. Empty arrays are handled correctly.

### Tests for User Story 3 ⚠️

- [x] T028 [P] [US3] Write unit test for parseJsonResponse() method with markdown code blocks in backend-dilemma/src/modules/feedback/feedback.service.spec.ts
- [x] T029 [P] [US3] Write unit test for parseJsonResponse() method with direct JSON in backend-dilemma/src/modules/feedback/feedback.service.spec.ts
- [x] T030 [P] [US3] Write unit test for parseJsonResponse() method with invalid format in backend-dilemma/src/modules/feedback/feedback.service.spec.ts
- [x] T031 [P] [US3] Write unit test for parseJsonResponse() method with empty array in backend-dilemma/src/modules/feedback/feedback.service.spec.ts

### Implementation for User Story 3

- [x] T032 [US3] Implement parseJsonResponse() method with multi-strategy parsing (markdown extraction, direct JSON, fallback) in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T033 [US3] Implement validateResponseFormat() method to ensure result is array of strings in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T034 [US3] Integrate parseJsonResponse() and validateResponseFormat() into getFeedback() workflow in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T035 [US3] Add error handling for parsing failures with user-friendly messages in backend-dilemma/src/modules/feedback/feedback.service.ts

**Checkpoint**: At this point, all user stories should be independently functional

---

## Phase 6: Integration & Error Handling

**Purpose**: Complete integration with existing modules and comprehensive error handling

- [x] T036 Add UuidValidationGuard to FeedbackController analyze() endpoint in backend-dilemma/src/modules/feedback/feedback.controller.ts
- [x] T037 [P] Add error handling for OpenAI API errors (500) with user-friendly messages in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T038 [P] Add error handling for timeout errors (504) after 60 seconds in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T039 [P] Add request/response logging for OpenAI API calls in backend-dilemma/src/modules/feedback/feedback.service.ts
- [x] T040 Add integration test with real DilemmasService in backend-dilemma/test/feedback.e2e-spec.ts
- [x] T041 Add error scenario tests (OpenAI errors, timeouts, parsing failures) in backend-dilemma/test/feedback.e2e-spec.ts

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements, documentation, and final validation

- [x] T042 [P] Complete Swagger documentation with examples in backend-dilemma/src/modules/feedback/feedback.controller.ts
- [x] T043 [P] Add API examples matching quickstart.md in Swagger documentation
- [x] T044 Code cleanup and refactoring in backend-dilemma/src/modules/feedback/
- [ ] T045 [P] Run quickstart.md validation tests
- [ ] T046 Performance testing (100 concurrent requests)
- [ ] T047 Load testing to verify SC-004 (100 concurrent requests without degradation)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (all P1, but US1 is MVP)
  - US2 and US3 integrate with US1 but should be independently testable
- **Integration (Phase 6)**: Depends on all user stories (Phase 3-5) completion
- **Polish (Phase 7)**: Depends on Integration phase completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 (validation in service)
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 (response parsing in service)

### Within Each User Story

- Tests (TDD) MUST be written and FAIL before implementation
- DTOs before services
- Services before controllers
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002, T003 can run in parallel
- **Phase 2**: T005, T006, T007, T008 can run in parallel
- **Phase 3 (US1)**: T010, T011 (tests) can run in parallel
- **Phase 4 (US2)**: T020, T021 (tests) can run in parallel
- **Phase 5 (US3)**: T028, T029, T030, T031 (tests) can run in parallel
- **Phase 6**: T037, T038, T039 can run in parallel
- **Phase 7**: T042, T043, T045 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write unit test for FeedbackService.getFeedback() in feedback.service.spec.ts"
Task: "Write E2E test for POST /api/feedback/analyze in feedback.e2e-spec.ts"

# After tests are written and failing, implement in order:
Task: "Initialize OpenAI client in FeedbackService constructor"
Task: "Implement buildPrompt() method"
Task: "Implement createThreadAndRun() method"
Task: "Implement waitForCompletion() method"
Task: "Implement extractResponse() method"
Task: "Implement getFeedback() method"
Task: "Implement analyze() endpoint handler"
Task: "Add Swagger documentation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (write tests first, then implement)
4. **STOP and VALIDATE**: Test User Story 1 independently via POST /api/feedback/analyze
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Integration & Error Handling → Test → Deploy/Demo
6. Add Polish → Final validation → Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (tests → implementation)
   - Developer B: User Story 2 (tests → implementation) - can start after US1 service skeleton
   - Developer C: User Story 3 (tests → implementation) - can start after US1 service skeleton
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD MANDATORY**: Verify tests fail before implementing (Constitution III)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All user stories are P1, but US1 is MVP (core functionality)
- US2 and US3 enhance US1 but can be tested independently

---

## Task Summary

- **Total Tasks**: 47
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 6 tasks
- **Phase 3 (User Story 1)**: 10 tasks (2 tests + 8 implementation)
- **Phase 4 (User Story 2)**: 8 tasks (2 tests + 6 implementation)
- **Phase 5 (User Story 3)**: 9 tasks (4 tests + 5 implementation)
- **Phase 6 (Integration)**: 6 tasks
- **Phase 7 (Polish)**: 5 tasks

**Parallel Opportunities**: 20+ tasks can run in parallel across different phases

**MVP Scope**: Phases 1-3 (User Story 1) - 19 tasks total

**Independent Test Criteria**:
- **US1**: POST /api/feedback/analyze with valid data returns 200 with counterArguments
- **US2**: POST /api/feedback/analyze with invalid data returns 400/404 without calling AI
- **US3**: Mocked AI responses are correctly parsed and validated
