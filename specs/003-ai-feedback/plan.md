# Implementation Plan: Модуль AI-фидбэка для дилем

**Branch**: `003-ai-feedback` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ai-feedback/spec.md`

## Summary

Реализация модуля для получения AI-фидбэка на выбор пользователя в дилеме. Модуль принимает дилемму, выбор пользователя (A или B) и опциональные размышления, отправляет запрос к OpenAI Assistant и возвращает массив контраргументов, объясняющих потенциальные недостатки выбранного решения. Технический подход: NestJS модуль с интеграцией OpenAI API через официальный SDK, stateless операция без персистентности запросов.

## Technical Context

**Language/Version**: TypeScript 5.7+ (strict mode)  
**Primary Dependencies**: NestJS 11.x, OpenAI SDK (openai), TypeORM, class-validator, @nestjs/swagger  
**Storage**: N/A (stateless operation, no persistence required)  
**Testing**: Jest (unit tests), Supertest (E2E tests)  
**Target Platform**: Node.js server (Linux/macOS/Windows)  
**Project Type**: Backend API module (REST)  
**Performance Goals**: 100 concurrent feedback requests without degradation, average response time under 20 seconds  
**Constraints**: <30 seconds max response time (SC-001), 60 seconds timeout for AI requests, 5000 character limit for reasoning text  
**Scale/Scope**: Stateless module, handles unlimited concurrent requests (limited by OpenAI API rate limits)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **I. NestJS Modular Architecture**: Feature will be organized as a separate NestJS module (feedback) following existing module patterns (decisions, dilemmas, statistics)  
✅ **II. TypeScript First**: All code in TypeScript with strict mode, explicit types, interfaces for DTOs  
✅ **III. Test-First Development**: TDD for business logic (AI response parsing, validation), E2E tests for API endpoint  
✅ **IV. RESTful API Design**: Single POST endpoint `/api/feedback/analyze` following REST principles with proper HTTP status codes and Swagger documentation  
✅ **V. Data Validation & Security**: class-validator for input validation (dilemma name, choice, reasoning length), UUID validation via existing guard, no input sanitization per spec

**Post-Design Check**: All gates remain valid after design phase.

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-feedback/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   └── api-spec.json    # OpenAPI specification
└── tasks.md             # Phase 2 output (to be created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend-dilemma/
├── src/
│   ├── modules/
│   │   ├── feedback/              # New module
│   │   │   ├── feedback.module.ts
│   │   │   ├── feedback.controller.ts
│   │   │   ├── feedback.service.ts
│   │   │   └── dto/
│   │   │       ├── feedback-request.dto.ts
│   │   │       └── feedback-response.dto.ts
│   │   ├── users/                  # Existing
│   │   ├── dilemmas/               # Existing
│   │   ├── decisions/              # Existing
│   │   └── statistics/             # Existing
│   ├── common/                     # Existing (decorators, guards)
│   └── main.ts
└── package.json
```

**Structure Decision**: Single NestJS backend project with new feedback module following existing module patterns. Module is stateless and does not require database entities or migrations.

## Implementation Phases

### Phase 0: Research & Setup

**Goal**: Resolve technical decisions for OpenAI integration and setup module infrastructure

**Research Tasks**:
1. Research OpenAI Assistant API integration patterns for NestJS
2. Research OpenAI SDK (openai package) usage and best practices
3. Research error handling patterns for external API calls (timeouts, retries)
4. Research JSON parsing strategies for AI responses (markdown code blocks, direct JSON)
5. Setup feedback module structure

**Output**: research.md

### Phase 1: Design & Contracts

**Goal**: Design API contracts, DTOs, and service interfaces

**Tasks**:
1. Design API endpoint: POST /api/feedback/analyze
2. Create DTOs: FeedbackRequestDto, FeedbackResponseDto
3. Design service interface for OpenAI integration
4. Design prompt construction logic
5. Design response parsing and validation logic
6. Create OpenAPI/Swagger specification
7. Create quickstart guide with examples

**Output**: data-model.md, contracts/api-spec.json, quickstart.md

### Phase 2: Feedback Module Implementation

**Goal**: Implement core feedback functionality

**Tasks**:
1. Create FeedbackModule, FeedbackService, FeedbackController
2. Install and configure OpenAI SDK (openai package)
3. Implement OpenAI client initialization with assistant ID from config
4. Implement prompt construction (dilemma description, choice, reasoning)
5. Implement OpenAI thread creation and message sending
6. Implement run creation and completion waiting (with 60s timeout)
7. Implement response extraction and JSON parsing
8. Implement response validation (must be array of strings)
9. Add error handling for OpenAI API errors
10. Add timeout handling (60 seconds)
11. Create DTOs with validation decorators
12. Add Swagger documentation
13. Unit tests for FeedbackService (mocked OpenAI client)
14. E2E tests for API endpoint

**Dependencies**: Phase 0, Phase 1

### Phase 3: Integration & Validation

**Goal**: Integrate with existing modules and add validation

**Tasks**:
1. Integrate with DilemmasService to fetch dilemma details
2. Add dilemma existence validation
3. Add dilemma active status check
4. Add choice validation (A or B)
5. Add reasoning length validation (max 5000 characters)
6. Use existing UuidValidationGuard for user identification
7. Add proper error responses (404 for not found, 400 for validation errors)
8. Integration tests with real dilemma data
9. Error scenario tests

**Dependencies**: Phase 2

### Phase 4: Polish & Documentation

**Goal**: Error handling, logging, and documentation

**Tasks**:
1. Add comprehensive error handling (OpenAI errors, timeouts, parsing errors)
2. Add request/response logging
3. Add user-friendly error messages
4. Complete Swagger documentation
5. Add API examples
6. Performance testing
7. Load testing (100 concurrent requests)

**Dependencies**: Phase 3

## API Endpoints Summary

### Feedback
- `POST /api/feedback/analyze` - Request AI feedback on dilemma choice
  - Headers: `X-User-UUID` (required)
  - Body: `{ dilemmaName: string, choice: 'A' | 'B', reasoning?: string }`
  - Response: `{ counterArguments: string[] }`
  - Errors: 400 (validation), 404 (dilemma not found), 500 (AI service error), 504 (timeout)

## Data Model

### DTOs (No Database Entities Required)

**FeedbackRequestDto**:
- `dilemmaName: string` (required, validated against existing dilemmas)
- `choice: 'A' | 'B'` (required, enum validation)
- `reasoning?: string` (optional, max 5000 characters)

**FeedbackResponseDto**:
- `counterArguments: string[]` (array of strings, no size limit)

### External Dependencies

- **DilemmasService**: For fetching dilemma details and validation
- **OpenAI Assistant API**: For generating counter-arguments (assistant ID: asst_8GvBqeGy2jXoklcWS8OmgQE8)

## Testing Strategy

### Unit Tests
- FeedbackService: prompt construction, response parsing, error handling
- DTOs: validation rules
- OpenAI client mocking
- Target: 80%+ coverage for business logic

### E2E Tests
- POST /api/feedback/analyze endpoint
- Success scenarios (with/without reasoning)
- Error scenarios (invalid dilemma, invalid choice, timeout, AI errors)
- Edge cases (empty reasoning, very long reasoning, special characters)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API rate limits | High | Monitor usage, implement retry logic with exponential backoff |
| OpenAI API downtime | High | Graceful error handling, user-friendly error messages |
| Response parsing failures | Medium | Robust JSON parsing with fallbacks, comprehensive error handling |
| Timeout scenarios | Medium | 60-second timeout with clear error messages |
| Long response times | Medium | Async processing, timeout handling, user feedback |

## Success Metrics

- All feedback requests processed within 30 seconds (SC-001)
- 95% of valid requests succeed without errors (SC-002)
- 90% of AI responses correctly parsed (SC-005)
- 100% of failed requests return user-friendly error messages (SC-006)
- Average response time under 20 seconds (SC-007)
- System handles 100 concurrent requests without degradation (SC-004)
