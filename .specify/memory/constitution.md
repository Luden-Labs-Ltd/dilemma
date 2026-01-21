# Dilemma Backend Constitution

## Core Principles

### I. NestJS Modular Architecture
Every feature must be organized as a NestJS module with clear boundaries. Modules must be self-contained, independently testable, and follow dependency injection principles. Each module should have: controller, service, entities/DTOs, and tests.

### II. TypeScript First
All code must be written in TypeScript with strict mode enabled. Use interfaces over types for object shapes. Prefer explicit types over `any`. All public methods must have explicit return types.

### III. Test-First Development (NON-NEGOTIABLE)
TDD mandatory for business logic: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. Unit tests for services, E2E tests for API endpoints.

### IV. RESTful API Design
All APIs must follow RESTful principles. Use standard HTTP methods (GET, POST, PUT, PATCH, DELETE). Version APIs through `/api/v1/` prefix. Use proper HTTP status codes. All endpoints must be documented with Swagger/OpenAPI.

### V. Data Validation & Security
All user input must be validated using class-validator. Sanitize all inputs. Use UUID for user identification (client_uuid from frontend). Implement rate limiting for API endpoints. Never expose sensitive data in responses.

## Technology Stack

### Required Technologies
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7+ (strict mode)
- **Database**: PostgreSQL
- **ORM**: TypeORM (preferred) or Prisma
- **Validation**: class-validator, class-transformer
- **API Documentation**: @nestjs/swagger
- **Package Manager**: pnpm

### Project Structure
```
src/
├── modules/
│   ├── users/          # User management module
│   ├── dilemmas/       # Dilemma management module
│   ├── decisions/      # Decision tracking module
│   └── statistics/     # Statistics module
├── common/             # Shared utilities, decorators, guards
├── config/             # Configuration files
└── main.ts             # Application entry point
```

## Code Conventions

### Naming
- **Classes**: PascalCase (e.g., `DilemmaService`)
- **Methods/Functions**: camelCase (e.g., `getDilemmaById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Files**: kebab-case (e.g., `dilemma.service.ts`)
- **DTOs**: Suffix `Dto` (e.g., `CreateDilemmaDto`)
- **Entities**: No suffix (e.g., `Dilemma`)

### File Organization
- Each module in its own directory
- Entities in `entities/` subdirectory
- DTOs in `dto/` subdirectory
- Tests co-located with files (`*.spec.ts`)

## Database Conventions

### Migrations
- All schema changes through migrations
- Migrations must be reversible (up/down)
- Naming: `YYYYMMDDHHMMSS-description.ts`

### Entities
- Use TypeORM decorators for schema definition
- All relationships must be explicitly defined
- Use indexes for frequently queried fields
- UUID for primary keys where appropriate

## API Design Rules

### Endpoints
- RESTful URL structure: `/api/{resource}/{id?}/{sub-resource?}`
- Use proper HTTP methods
- Version through `/api/v1/` prefix
- All endpoints must return structured JSON

### Validation
- Use `class-validator` for DTO validation
- Validation at controller level via `ValidationPipe`
- All user inputs must be validated

### Error Handling
- Use NestJS exception filters
- Create custom exceptions for business logic
- Always return structured error responses
- Log errors with context

## Testing Requirements

### Unit Tests
- Minimum 80% coverage for business logic
- Use Jest as testing framework
- Mock external dependencies
- Test services, utilities, guards

### E2E Tests
- Test all API endpoints
- Use test database
- Clean data after each test
- Test complete user flows

## Security Requirements

- Sanitize all user inputs
- Use UUID for user identification (no authentication required for basic operations)
- Implement rate limiting
- Log suspicious activity
- Never expose sensitive data

## Performance Standards

- Cache statistics (TTL: 5 minutes)
- Optimize database queries (use indexes, avoid N+1)
- Pagination for list endpoints
- Async processing for heavy operations

## Development Workflow

### Git Workflow
- Use conventional commits: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Branch naming: `feature/*`, `fix/*`

### Code Review
- Minimum one approving review before merge
- Check constitution compliance
- Verify tests and coverage
- Check security and performance

## Governance

Constitution supersedes all other practices. Amendments require documentation, approval, and migration plan. All PRs/reviews must verify compliance. Complexity must be justified.

**Version**: 1.0.0 | **Ratified**: 2025-01-15 | **Last Amended**: 2025-01-15
