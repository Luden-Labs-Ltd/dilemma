# Research: Модуль AI-фидбэка для дилем

**Feature**: 003-ai-feedback  
**Date**: 2025-01-27  
**Phase**: 0 - Research & Setup

## Research Questions

### 1. OpenAI Assistant API Integration Patterns for NestJS

**Question**: How to integrate OpenAI Assistant API in NestJS application following best practices?

**Decision**: Use official OpenAI SDK (`openai` package) with NestJS dependency injection pattern. Create a service that wraps OpenAI client and provides typed methods for assistant interactions.

**Rationale**:
- Official SDK provides type safety and better error handling
- NestJS service pattern allows for dependency injection and testing
- ConfigService integration for API keys and assistant ID
- Follows existing project patterns (similar to how other external services are integrated)

**Alternatives Considered**:
- Direct HTTP calls to OpenAI API: Rejected - SDK provides better abstraction and error handling
- Custom wrapper library: Rejected - Official SDK is well-maintained and feature-complete

**Implementation Notes**:
- Use `openai` npm package (latest stable version)
- Initialize OpenAI client in service constructor with API key from ConfigService
- Store assistant ID in ConfigService (environment variable)
- Use async/await for all OpenAI API calls

---

### 2. OpenAI SDK Usage and Best Practices

**Question**: What are best practices for using OpenAI SDK with Assistant API (threads, runs, messages)?

**Decision**: Follow OpenAI Assistant API workflow: create thread → add message → create run → wait for completion → extract response.

**Rationale**:
- This is the standard workflow for Assistant API
- Thread-based approach allows for conversation context (though not needed for this feature, it's the API pattern)
- Run completion waiting with polling is required for async operations

**Implementation Pattern**:
```typescript
1. Create thread: openai.beta.threads.create()
2. Add message: openai.beta.threads.messages.create(threadId, { role: 'user', content: prompt })
3. Create run: openai.beta.threads.runs.create(threadId, { assistant_id })
4. Wait for completion: Poll run status until 'completed' (with timeout)
5. Extract response: openai.beta.threads.messages.list(threadId) and filter assistant messages
```

**Error Handling**:
- Handle OpenAI API errors (rate limits, invalid requests, etc.)
- Implement timeout (60 seconds as per spec)
- Handle run failures (status: 'failed', 'cancelled', 'expired')

**Alternatives Considered**:
- Synchronous API calls: Not available for Assistant API
- Webhook-based approach: More complex, not needed for this use case

---

### 3. Error Handling Patterns for External API Calls

**Question**: How to handle errors, timeouts, and retries for OpenAI API calls?

**Decision**: Implement timeout handling (60 seconds), graceful error handling with user-friendly messages, no automatic retries (fail fast for better UX).

**Rationale**:
- Timeout prevents hanging requests (60 seconds as per spec)
- User-friendly error messages improve UX (SC-006)
- No retries: AI feedback is not critical path, better to fail fast and let user retry
- Log errors for monitoring but don't expose internal details to users

**Error Categories**:
1. **Validation Errors** (400): Invalid input, return before API call
2. **Not Found** (404): Dilemma not found, return before API call
3. **OpenAI API Errors**: Network errors, API errors, rate limits
4. **Timeout Errors** (504): Request exceeds 60 seconds
5. **Parsing Errors**: Invalid JSON response from AI

**Implementation**:
- Use try-catch for OpenAI API calls
- Implement timeout using Promise.race or setTimeout
- Map OpenAI errors to user-friendly messages
- Log detailed errors server-side for debugging

**Alternatives Considered**:
- Automatic retries with exponential backoff: Rejected - adds complexity, not needed for non-critical feature
- Circuit breaker pattern: Rejected - overkill for single external dependency

---

### 4. JSON Parsing Strategies for AI Responses

**Question**: How to reliably parse JSON array from AI responses that may include markdown code blocks?

**Decision**: Implement multi-strategy parsing: try markdown code block extraction first, then direct JSON parsing, with fallback error handling.

**Rationale**:
- AI responses may include markdown formatting (```json ... ```)
- Need to handle both formatted and raw JSON responses
- Robust parsing prevents failures from minor formatting differences

**Parsing Strategy**:
1. Try extracting JSON from markdown code blocks: `response.match(/```(?:json)?\s*([\s\S]*?)\s*```/)`
2. Try finding JSON object/array directly: `response.match(/\[[\s\S]*\]/)`
3. Try parsing entire response as JSON
4. Validate parsed result is array of strings
5. Return error if all strategies fail

**Validation**:
- Check that result is array
- Check that all elements are strings
- Handle empty arrays (valid response)

**Alternatives Considered**:
- Strict JSON parsing only: Rejected - AI may return markdown-formatted responses
- AI prompt to enforce JSON-only: Partially implemented in prompt, but need fallback parsing

---

### 5. Module Structure and Integration

**Question**: How to structure feedback module and integrate with existing modules?

**Decision**: Create standalone FeedbackModule following existing module patterns, inject DilemmasService for validation, use existing guards and decorators.

**Rationale**:
- Follows NestJS modular architecture (Constitution I)
- Reuses existing DilemmasService for dilemma validation
- Uses existing UuidValidationGuard for user identification
- Maintains separation of concerns

**Module Structure**:
```
feedback/
├── feedback.module.ts        # Module definition, imports DilemmasModule
├── feedback.controller.ts     # REST endpoint
├── feedback.service.ts        # Business logic, OpenAI integration
└── dto/
    ├── feedback-request.dto.ts
    └── feedback-response.dto.ts
```

**Dependencies**:
- DilemmasModule: For dilemma validation and fetching
- ConfigModule: For OpenAI API key and assistant ID
- Common guards/decorators: For UUID validation

**Alternatives Considered**:
- Embed in DecisionsModule: Rejected - different concern, feedback is independent feature
- Create shared AI service: Considered but rejected - feedback is specific use case, may have other AI features later

---

## Technology Decisions Summary

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| openai | Latest stable | OpenAI SDK | Official SDK, type safety, best practices |
| @nestjs/config | ^4.0.2 | Configuration | Already in project, for API keys |
| class-validator | ^0.14.1 | DTO validation | Already in project, for input validation |

## Configuration Requirements

**Environment Variables**:
- `OPENAI_API_KEY`: OpenAI API key (required)
- `OPENAI_ASSISTANT_ID`: Assistant ID `asst_8GvBqeGy2jXoklcWS8OmgQE8` (required)

**Module Imports**:
- DilemmasModule (for dilemma validation)
- ConfigModule (for configuration)

## Implementation Notes

1. **Timeout Implementation**: Use Promise.race with timeout promise and OpenAI API call
2. **Error Mapping**: Map OpenAI errors to HTTP status codes (500 for API errors, 504 for timeout)
3. **Logging**: Log all OpenAI API calls and errors for monitoring
4. **Testing**: Mock OpenAI client for unit tests, use test assistant for E2E tests (if available)

## Open Questions Resolved

✅ All research questions resolved. No NEEDS CLARIFICATION markers remain.
