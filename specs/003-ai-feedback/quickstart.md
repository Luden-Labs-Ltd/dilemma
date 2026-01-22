# Quickstart Guide: Модуль AI-фидбэка для дилем

**Feature**: 003-ai-feedback  
**Date**: 2025-01-27

## Overview

Этот гайд поможет быстро начать работу с модулем AI-фидбэка. Модуль предоставляет endpoint для получения AI-фидбэка на выбор пользователя в дилеме.

## Prerequisites

1. Backend сервер запущен и доступен
2. OpenAI API ключ настроен в переменных окружения
3. OpenAI Assistant ID настроен (`asst_8GvBqeGy2jXoklcWS8OmgQE8`)
4. Существует хотя бы одна активная дилема в системе

## Environment Variables

```bash
OPENAI_API_KEY=sk-...
OPENAI_ASSISTANT_ID=asst_8GvBqeGy2jXoklcWS8OmgQE8
```

## API Endpoint

**POST** `/api/feedback/analyze`

### Headers

```
X-User-UUID: <user-uuid>
Content-Type: application/json
```

### Request Body

```json
{
  "dilemmaName": "dilemma1",
  "choice": "A",
  "reasoning": "Мне нужны деньги сейчас, поэтому я оставлю кошелек себе"
}
```

**Fields**:
- `dilemmaName` (required): Имя дилемы
- `choice` (required): Выбор пользователя ('A' или 'B')
- `reasoning` (optional): Размышления пользователя (максимум 5000 символов)

### Response

**Success (200)**:
```json
{
  "counterArguments": [
    "Это решение игнорирует морально-этическую сторону вопроса: найденное следует возвращать, чтобы поступать справедливо.",
    "Оставить кошелёк может привести к чувству вины или нежелательным последствиям, если владелец обнаружит потерю.",
    "Аргумент о неосведомлённости о владельце не оправдывает присвоение чужого имущества."
  ]
}
```

## Example Requests

### cURL

**Request with reasoning**:
```bash
curl -X POST http://localhost:3000/api/feedback/analyze \
  -H "Content-Type: application/json" \
  -H "X-User-UUID: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{
    "dilemmaName": "dilemma1",
    "choice": "A",
    "reasoning": "Мне нужны деньги сейчас"
  }'
```

**Request without reasoning**:
```bash
curl -X POST http://localhost:3000/api/feedback/analyze \
  -H "Content-Type: application/json" \
  -H "X-User-UUID: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{
    "dilemmaName": "dilemma1",
    "choice": "B"
  }'
```

### JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/api/feedback/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-UUID': '123e4567-e89b-12d3-a456-426614174000'
  },
  body: JSON.stringify({
    dilemmaName: 'dilemma1',
    choice: 'A',
    reasoning: 'Мне нужны деньги сейчас'
  })
});

const data = await response.json();
console.log(data.counterArguments);
```

### TypeScript (Axios)

```typescript
import axios from 'axios';

interface FeedbackRequest {
  dilemmaName: string;
  choice: 'A' | 'B';
  reasoning?: string;
}

interface FeedbackResponse {
  counterArguments: string[];
}

const getFeedback = async (
  userUuid: string,
  request: FeedbackRequest
): Promise<FeedbackResponse> => {
  const response = await axios.post<FeedbackResponse>(
    'http://localhost:3000/api/feedback/analyze',
    request,
    {
      headers: {
        'X-User-UUID': userUuid,
      },
    }
  );
  return response.data;
};

// Usage
const feedback = await getFeedback('123e4567-e89b-12d3-a456-426614174000', {
  dilemmaName: 'dilemma1',
  choice: 'A',
  reasoning: 'Мне нужны деньги сейчас',
});

console.log(feedback.counterArguments);
```

## Error Scenarios

### Validation Error (400)

**Request**: Invalid choice
```json
{
  "dilemmaName": "dilemma1",
  "choice": "C"
}
```

**Response**:
```json
{
  "statusCode": 400,
  "message": "choice must be one of the following values: A, B",
  "error": "Bad Request"
}
```

### Dilemma Not Found (404)

**Request**: Non-existent dilemma
```json
{
  "dilemmaName": "nonexistent",
  "choice": "A"
}
```

**Response**:
```json
{
  "statusCode": 404,
  "message": "Dilemma 'nonexistent' not found or inactive",
  "error": "Not Found"
}
```

### Timeout (504)

**Response** (if AI service doesn't respond within 60 seconds):
```json
{
  "statusCode": 504,
  "message": "AI service did not respond in time. Please try again.",
  "error": "Gateway Timeout"
}
```

## Testing Scenarios

### Test Case 1: Successful Request with Reasoning

1. **Given**: Valid dilemma exists, user has valid UUID
2. **When**: Send POST request with dilemmaName, choice='A', and reasoning
3. **Then**: Receive 200 response with array of counter-arguments

### Test Case 2: Successful Request without Reasoning

1. **Given**: Valid dilemma exists, user has valid UUID
2. **When**: Send POST request with dilemmaName and choice='B', no reasoning
3. **Then**: Receive 200 response with array of counter-arguments

### Test Case 3: Validation Error - Invalid Choice

1. **Given**: Valid dilemma exists
2. **When**: Send POST request with choice='C'
3. **Then**: Receive 400 response with validation error

### Test Case 4: Validation Error - Reasoning Too Long

1. **Given**: Valid dilemma exists
2. **When**: Send POST request with reasoning > 5000 characters
3. **Then**: Receive 400 response with validation error

### Test Case 5: Dilemma Not Found

1. **Given**: Dilemma doesn't exist
2. **When**: Send POST request with non-existent dilemmaName
3. **Then**: Receive 404 response

## Performance Expectations

- **Average Response Time**: < 20 seconds (SC-007)
- **Maximum Response Time**: < 30 seconds (SC-001)
- **Timeout**: 60 seconds
- **Concurrent Requests**: System handles 100 concurrent requests without degradation (SC-004)

## Next Steps

1. **Integration**: Integrate endpoint into frontend application
2. **Error Handling**: Implement user-friendly error handling on frontend
3. **Loading States**: Show loading indicator during AI processing
4. **Retry Logic**: Implement retry logic for failed requests (optional)

## Troubleshooting

### Issue: 500 Internal Server Error

**Possible Causes**:
- OpenAI API key invalid or missing
- OpenAI Assistant ID incorrect
- Network connectivity issues

**Solution**: Check environment variables and OpenAI API status

### Issue: 504 Gateway Timeout

**Possible Causes**:
- AI service is slow or overloaded
- Network latency

**Solution**: Retry request, check OpenAI API status

### Issue: Empty counterArguments Array

**Possible Causes**:
- AI didn't find counter-arguments (valid response)
- AI response parsing issue

**Solution**: This is a valid response, AI may not always find counter-arguments
