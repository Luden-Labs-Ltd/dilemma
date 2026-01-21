# Implementation Plan: Система дилем с фиксацией изменений решений

**Branch**: `001-dilemma-system` | **Date**: 2025-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dilemma-system/spec.md`

## Summary

Реализация REST API для системы этических дилем с возможностью изменения решения после получения фидбэка. Система отслеживает 4 траектории пользователей (AA, AB, BB, BA) и предоставляет статистику. Технический подход: NestJS модульная архитектура с TypeORM и PostgreSQL.

## Technical Context

**Language/Version**: TypeScript 5.7+ (strict mode)  
**Primary Dependencies**: NestJS 11.x, TypeORM, PostgreSQL, class-validator, @nestjs/swagger  
**Storage**: PostgreSQL database  
**Testing**: Jest (unit tests), Supertest (E2E tests)  
**Target Platform**: Node.js server (Linux/macOS/Windows)  
**Project Type**: Backend API (REST)  
**Performance Goals**: 1000 concurrent users, 95% requests under 500ms  
**Constraints**: <500ms p95 response time, support 1000+ concurrent users  
**Scale/Scope**: Initial MVP with 3 dilemmas, scalable to handle 10k+ users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **I. NestJS Modular Architecture**: Feature will be organized as separate modules (users, dilemmas, decisions, statistics)  
✅ **II. TypeScript First**: All code in TypeScript with strict mode  
✅ **III. Test-First Development**: TDD for business logic, E2E tests for API endpoints  
✅ **IV. RESTful API Design**: All endpoints follow REST principles with proper HTTP methods and status codes  
✅ **V. Data Validation & Security**: class-validator for input validation, UUID for user identification

**Post-Design Check**: All gates remain valid after design phase.

## Project Structure

### Documentation (this feature)

```text
specs/001-dilemma-system/
├── plan.md              # This file
├── spec.md              # Feature specification
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
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   ├── dilemmas/
│   │   │   ├── dilemmas.module.ts
│   │   │   ├── dilemmas.controller.ts
│   │   │   ├── dilemmas.service.ts
│   │   │   ├── entities/
│   │   │   │   └── dilemma.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-dilemma.dto.ts
│   │   │       └── dilemma-response.dto.ts
│   │   ├── decisions/
│   │   │   ├── decisions.module.ts
│   │   │   ├── decisions.controller.ts
│   │   │   ├── decisions.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user-decision.entity.ts
│   │   │   └── dto/
│   │   │       ├── initial-choice.dto.ts
│   │   │       ├── final-choice.dto.ts
│   │   │       └── decision-response.dto.ts
│   │   └── statistics/
│   │       ├── statistics.module.ts
│   │       ├── statistics.controller.ts
│   │       ├── statistics.service.ts
│   │       └── dto/
│   │           └── statistics-response.dto.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   └── user-uuid.decorator.ts
│   │   ├── guards/
│   │   │   └── uuid-validation.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/
│   ├── config/
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   └── main.ts
├── test/
│   ├── unit/
│   ├── e2e/
│   └── fixtures/
├── migrations/
└── package.json
```

**Structure Decision**: Single NestJS backend project with modular architecture. Each feature domain (users, dilemmas, decisions, statistics) is a separate module following NestJS best practices.

## Implementation Phases

### Phase 0: Research & Setup

**Goal**: Resolve technical decisions and setup project infrastructure

**Tasks**:
1. Research TypeORM vs Prisma for NestJS (decision: TypeORM - better NestJS integration)
2. Research caching strategy for statistics (decision: in-memory cache with TTL, Redis optional later)
3. Setup NestJS project structure
4. Configure TypeORM with PostgreSQL
5. Setup testing infrastructure (Jest, Supertest)

**Output**: research.md

### Phase 1: Core Entities & Database

**Goal**: Create database schema and entities

**Tasks**:
1. Create User entity (id: UUID, client_uuid: UUID, timestamps)
2. Create Dilemma entity (id, name, title, description, options, feedback, is_active)
3. Create UserDecision entity (id, user_id, dilemma_id, choices, timestamps, calculated fields)
4. Create database migrations
5. Setup TypeORM configuration
6. Create seed data for 3 initial dilemmas

**Output**: data-model.md, migrations, entities

### Phase 2: Users Module

**Goal**: User management and UUID handling

**Tasks**:
1. Create UsersModule, UsersService, UsersController
2. Implement user creation/lookup by client_uuid
3. Create User entity and repository
4. Add UUID validation decorator/guard
5. Unit tests for UsersService
6. E2E tests for user endpoints

**Dependencies**: Phase 1

### Phase 3: Dilemmas Module (User Story 1)

**Goal**: List and view dilemmas

**Tasks**:
1. Create DilemmasModule, DilemmasService, DilemmasController
2. Implement GET /api/dilemmas (list active dilemmas)
3. Implement GET /api/dilemmas/{name} (dilemma details)
4. Add participant count calculation
5. Check if user already participated
6. Create DTOs for requests/responses
7. Add Swagger documentation
8. Unit tests for DilemmasService
9. E2E tests for endpoints

**Dependencies**: Phase 2

### Phase 4: Decisions Module - Initial Choice (User Story 2)

**Goal**: Initial choice and feedback

**Tasks**:
1. Create DecisionsModule, DecisionsService, DecisionsController
2. Implement POST /api/decisions/initial
3. Create UserDecision with initial_choice
4. Validate user hasn't already participated
5. Return appropriate feedback (feedback_a or feedback_b)
6. Create DTOs (InitialChoiceDto, FeedbackResponseDto)
7. Business logic validation
8. Unit tests for DecisionsService
9. E2E tests for endpoint

**Dependencies**: Phase 3

### Phase 5: Decisions Module - Final Choice (User Story 3)

**Goal**: Final choice with mind change tracking

**Tasks**:
1. Implement POST /api/decisions/final
2. Update UserDecision with final_choice
3. Calculate changed_mind (initial_choice != final_choice)
4. Calculate time_to_decide (final_at - initial_at in seconds)
5. Validate initial choice exists
6. Validate final choice not already set
7. Create FinalChoiceDto, DecisionResponseDto
8. Unit tests for calculation logic
9. E2E tests for endpoint

**Dependencies**: Phase 4

### Phase 6: Personal Statistics (User Story 4)

**Goal**: User's decision history

**Tasks**:
1. Implement GET /api/decisions/my
2. Query all UserDecisions for user
3. Calculate path (AA, AB, BB, BA) for each decision
4. Format response with dilemma details
5. Create MyDecisionsResponseDto
6. Unit tests
7. E2E tests

**Dependencies**: Phase 5

### Phase 7: Statistics Module (User Story 5)

**Goal**: Aggregated statistics for dilemmas

**Tasks**:
1. Create StatisticsModule, StatisticsService, StatisticsController
2. Implement GET /api/statistics/dilemma/{name}
3. Aggregate statistics by 4 paths (AA, AB, BB, BA)
4. Calculate percentages
5. Calculate change_rate (% who changed mind)
6. Calculate avg_time_to_decide
7. Implement caching (5 min TTL)
8. Handle edge case: <10 participants (optional privacy)
9. Create StatisticsResponseDto
10. Unit tests for aggregation logic
11. E2E tests

**Dependencies**: Phase 5

### Phase 8: Polish & Optimization

**Goal**: Performance, error handling, documentation

**Tasks**:
1. Add global exception filters
2. Add request logging
3. Optimize database queries (add indexes)
4. Add rate limiting (optional)
5. Complete Swagger documentation
6. Add API versioning
7. Performance testing
8. Load testing

**Dependencies**: All previous phases

## API Endpoints Summary

### Dilemmas
- `GET /api/dilemmas` - List active dilemmas
- `GET /api/dilemmas/{name}` - Get dilemma details

### Decisions
- `POST /api/decisions/initial` - Make initial choice
- `POST /api/decisions/final` - Make final choice
- `GET /api/decisions/my` - Get user's decision history

### Statistics
- `GET /api/statistics/dilemma/{name}` - Get dilemma statistics

## Database Schema

### Tables
1. **users**: id (UUID), client_uuid (UUID, unique), created_at, last_active
2. **dilemmas**: id (serial), name (varchar, unique), title, description, option_a_title, option_a_description, option_b_title, option_b_description, feedback_a, feedback_b, is_active, timestamps
3. **user_decisions**: id (serial), user_id (FK), dilemma_id (FK), initial_choice (enum A/B), final_choice (enum A/B, nullable), changed_mind (boolean), initial_at, final_at, time_to_decide (integer)

### Indexes
- users.client_uuid (unique)
- user_decisions(user_id, dilemma_id) (unique constraint)
- user_decisions.dilemma_id (for statistics queries)
- user_decisions.final_choice (for filtering completed)

## Testing Strategy

### Unit Tests
- Services: business logic, calculations, validations
- Entities: relationships, constraints
- DTOs: validation rules
- Target: 80%+ coverage for business logic

### E2E Tests
- All API endpoints
- Complete user flows (initial → final choice)
- Error scenarios
- Edge cases (duplicate participation, invalid UUID, etc.)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database performance with large statistics | High | Implement caching, optimize queries with indexes |
| Concurrent requests from same user | Medium | Database unique constraint, transaction handling |
| UUID validation issues | Medium | Strict validation guard, clear error messages |
| Statistics calculation accuracy | Medium | Comprehensive unit tests, E2E validation |

## Success Metrics

- All API endpoints respond in <500ms (p95)
- 100% test coverage for business logic
- Zero data loss for user decisions
- Statistics calculations are accurate
- System handles 1000 concurrent users
