# API Contract: AI Feedback Analyze

**Feature**: `004-feedback-integration`  
**Source**: Production Swagger `https://dilemma-production-0f6b.up.railway.app/api/docs` / `003-ai-feedback` backend.

## POST /api/feedback/analyze

- **Method**: `POST`
- **Path**: `/api/feedback/analyze`
- **Headers**: `X-User-UUID: <uuid>` (required), `Content-Type: application/json`
- **Purpose**: Отправить выбор пользователя и опционально reasoning в AI; получить массив контраргументов.

### Request Body

```json
{
  "dilemmaName": "string",
  "choice": "A" | "B",
  "reasoning": "string (optional, max 5000 chars)"
}
```

### Response 200

```json
{
  "counterArguments": ["string", ...]
}
```

### Errors

- **400**: Validation error (invalid choice, dilemmaName, etc.)
- **404**: Dilemma not found or inactive
- **500**: OpenAI API error
- **504**: Request timeout (AI did not respond in time)
