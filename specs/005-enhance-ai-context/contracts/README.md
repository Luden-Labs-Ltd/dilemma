# API Contract: Enhanced AI Feedback

**Feature**: `005-enhance-ai-context`  
**Source**: Implementation plan and data model

## POST /api/feedback/analyze

- **Method**: `POST`
- **Path**: `/api/feedback/analyze`
- **Headers**: 
  - `X-User-UUID: <uuid>` (required)
  - `Accept-Language: he|en|ru` (optional, default: he)
  - `Content-Type: application/json`
- **Purpose**: Отправить выбор пользователя и опционально reasoning в AI; получить массив контраргументов. Поддерживает передачу переводов дилеммы для улучшения контекста.

### Request Body

```json
{
  "dilemmaName": "string",
  "choice": "A" | "B",
  "reasoning": "string (optional, max 5000 chars)",
  "dilemmaText": {
    "title": "string (required)",
    "subtitle": "string (optional)",
    "questionText": "string (optional)",
    "description": "string (required)",
    "reflectionText": "string (optional)",
    "options": {
      "a": "string (required)",
      "b": "string (required)"
    }
  } (optional),
  "dilemmaTextOriginal": {
    "title": "string (required)",
    "subtitle": "string (optional)",
    "questionText": "string (optional)",
    "description": "string (required)",
    "reflectionText": "string (optional)",
    "options": {
      "a": "string (required)",
      "b": "string (required)"
    }
  } (optional)
}
```

### Response 200

```json
{
  "counterArguments": ["string", ...]
}
```

### Errors

- **400**: Validation error (invalid choice, dilemmaName, invalid structure of dilemmaText/dilemmaTextOriginal, etc.)
- **404**: Dilemma not found or inactive
- **500**: OpenAI API error
- **504**: Request timeout (AI did not respond in time)

### Backward Compatibility

Запросы без полей `dilemmaText` и `dilemmaTextOriginal` продолжают работать через существующую логику с i18n.

### Examples

#### Request with translations (new format)

```json
{
  "dilemmaName": "trolley-problem",
  "choice": "A",
  "reasoning": "אני חושב שצריך להקשיב למכונה",
  "dilemmaText": {
    "title": "שקיפות או יציבות",
    "subtitle": "דילמה צבאית",
    "questionText": "מה הפקודה שלך?",
    "description": "אתה מפקד ב-8200...",
    "reflectionText": "נקודה למחשבה...",
    "options": {
      "a": "אימוץ המלצת המכונה\nשתיקה להצלת חיים",
      "b": "פרסום אזהרה\nאמת גם במחיר דמים"
    }
  },
  "dilemmaTextOriginal": {
    "title": "Strategic Silence",
    "subtitle": "Military Dilemma",
    "questionText": "What is your command?",
    "description": "You are a commander in Unit 8200...",
    "reflectionText": "Point to consider...",
    "options": {
      "a": "ADOPT MACHINE RECOMMENDATION\nSilence to Save Lives",
      "b": "BROADCAST ALERT\nTruth at Any Cost"
    }
  }
}
```

#### Request without translations (backward compatible)

```json
{
  "dilemmaName": "medical",
  "choice": "B",
  "reasoning": "I think we should prioritize recovery chances"
}
```
