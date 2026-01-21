# Research: Система дилем - Технические решения

**Date**: 2025-01-15  
**Feature**: 001-dilemma-system

## Technology Decisions

### Decision 1: ORM Choice - TypeORM vs Prisma

**Decision**: TypeORM

**Rationale**:
- Better integration with NestJS ecosystem
- Native decorators align with NestJS patterns
- Active TypeScript support
- Good migration system
- Sufficient for project requirements

**Alternatives considered**:
- Prisma: Modern, type-safe, but less integrated with NestJS decorator patterns
- Sequelize: Older, less TypeScript-friendly

### Decision 2: Caching Strategy

**Decision**: In-memory cache with TTL (5 minutes) for statistics

**Rationale**:
- Statistics don't change frequently
- Simple implementation for MVP
- Can upgrade to Redis later if needed
- 5-minute TTL balances freshness and performance

**Alternatives considered**:
- Redis: More scalable but adds infrastructure complexity
- No cache: Would impact performance on statistics queries

### Decision 3: User Identification

**Decision**: UUID from frontend (client_uuid) via X-User-UUID header

**Rationale**:
- No authentication required (simpler MVP)
- UUID generated on frontend
- Stateless API design
- Can add authentication later if needed

**Alternatives considered**:
- JWT tokens: Adds complexity, not needed for MVP
- Session-based: Requires session storage

### Decision 4: Database Choice

**Decision**: PostgreSQL

**Rationale**:
- Robust, reliable, production-ready
- Good TypeORM support
- JSON support if needed later
- ACID compliance for data integrity
- Good performance for read-heavy statistics queries

**Alternatives considered**:
- MySQL: Similar but PostgreSQL has better JSON support
- SQLite: Too limited for production

### Decision 5: API Versioning

**Decision**: /api/v1/ prefix (optional for MVP, can start with /api/)

**Rationale**:
- Allows future API versions
- Can start simple with /api/ and add versioning later
- Follows REST best practices

## Best Practices Applied

### NestJS Patterns
- Modular architecture (one module per domain)
- Dependency injection throughout
- DTOs for all API inputs/outputs
- Service layer for business logic
- Repository pattern via TypeORM

### Database Patterns
- Migrations for all schema changes
- Indexes on frequently queried fields
- Unique constraints for business rules (one user per dilemma)
- Timestamps on all entities

### API Patterns
- RESTful design
- Proper HTTP status codes
- Structured error responses
- Swagger/OpenAPI documentation
- Input validation on all endpoints

## Performance Considerations

### Database
- Indexes on: client_uuid, (user_id, dilemma_id), dilemma_id, final_choice
- Query optimization for statistics aggregation
- Connection pooling

### Caching
- Statistics cached for 5 minutes
- Cache invalidation on new decisions
- In-memory cache (upgrade to Redis if needed)

### API
- Async/await for all I/O operations
- Efficient database queries (avoid N+1)
- Response compression (NestJS built-in)

## Security Considerations

- Input validation on all endpoints
- UUID format validation
- SQL injection prevention (TypeORM parameterized queries)
- Rate limiting (optional for MVP, add later)
- Error messages don't expose sensitive data

## Scalability Considerations

- Database indexes for performance
- Caching for statistics
- Stateless API design (horizontal scaling)
- Connection pooling
- Can add Redis, load balancer later
