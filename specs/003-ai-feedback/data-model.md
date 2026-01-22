# Data Model: Модуль AI-фидбэка для дилем

**Feature**: 003-ai-feedback  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

Модуль AI-фидбэка является stateless операцией и не требует персистентности данных в базе данных. Все данные передаются через API и обрабатываются в реальном времени. Модуль использует существующие сущности (Dilemma) для валидации, но не создает новых таблиц.

## DTOs (Data Transfer Objects)

### FeedbackRequestDto

**Purpose**: Входные данные для запроса AI-фидбэка

**Fields**:
- `dilemmaName: string` (required)
  - Валидация: непустая строка, должна соответствовать существующей дилемме
  - Пример: `"dilemma1"`
  
- `choice: 'A' | 'B'` (required)
  - Валидация: enum, только 'A' или 'B'
  - Пример: `"A"`
  
- `reasoning?: string` (optional)
  - Валидация: максимум 5000 символов, может быть null или пустой строкой
  - Пример: `"Мне нужны деньги сейчас, поэтому я оставлю кошелек себе"`
  - Примечание: опциональное поле, если не предоставлено, запрос обрабатывается без размышлений

**Validation Rules**:
- `dilemmaName`: `@IsString()`, `@IsNotEmpty()`, custom validation against DilemmasService
- `choice`: `@IsIn(['A', 'B'])`
- `reasoning`: `@IsOptional()`, `@IsString()`, `@MaxLength(5000)`

**Example**:
```typescript
{
  dilemmaName: "dilemma1",
  choice: "A",
  reasoning: "Мне нужны деньги сейчас"
}
```

---

### FeedbackResponseDto

**Purpose**: Ответ с массивом контраргументов от AI

**Fields**:
- `counterArguments: string[]` (required)
  - Массив строк, каждая строка - отдельный контраргумент
  - Нет ограничений на размер массива
  - Может быть пустым массивом (если AI не нашел контраргументов)
  - Пример: `["Это решение игнорирует морально-этическую сторону вопроса...", "Оставить кошелёк может привести к чувству вины..."]`

**Validation Rules**:
- `counterArguments`: `@IsArray()`, `@IsString({ each: true })`

**Example**:
```typescript
{
  counterArguments: [
    "Это решение игнорирует морально-этическую сторону вопроса: найденное следует возвращать, чтобы поступать справедливо.",
    "Оставить кошелёк может привести к чувству вины или нежелательным последствиям, если владелец обнаружит потерю.",
    "Аргумент о неосведомлённости о владельце не оправдывает присвоение чужого имущества."
  ]
}
```

---

## External Dependencies

### Dilemma Entity (Existing)

**Purpose**: Используется для валидации существования дилемы и получения её описания

**Fields Used**:
- `name: string` - для валидации существования дилемы
- `title: string` - для включения в промпт
- `description: string` - для включения в промпт
- `option_a_title: string` - для включения в промпт
- `option_a_description: string` - для включения в промпт
- `option_b_title: string` - для включения в промпт
- `option_b_description: string` - для включения в промпт
- `is_active: boolean` - для проверки активности дилемы

**Relationship**: FeedbackService зависит от DilemmasService для получения данных дилемы

---

## Request/Response Flow

### Request Flow

1. **Client Request** → `POST /api/feedback/analyze`
   - Headers: `X-User-UUID: <uuid>`
   - Body: `FeedbackRequestDto`

2. **Controller Validation** → `FeedbackController.analyze()`
   - Валидация DTO через class-validator
   - Проверка UUID через UuidValidationGuard

3. **Service Processing** → `FeedbackService.getFeedback()`
   - Валидация существования дилемы через DilemmasService
   - Проверка активности дилемы
   - Построение промпта для AI
   - Отправка запроса к OpenAI Assistant API
   - Ожидание ответа (таймаут 60 секунд)
   - Парсинг и валидация ответа
   - Возврат `FeedbackResponseDto`

4. **Response** → `FeedbackResponseDto`
   - Массив контраргументов

### Error Flow

1. **Validation Errors** (400):
   - Невалидный choice (не 'A' или 'B')
   - Reasoning превышает 5000 символов
   - Отсутствует dilemmaName

2. **Not Found Errors** (404):
   - Дилема не существует
   - Дилема неактивна

3. **OpenAI API Errors** (500):
   - Ошибки сети
   - Ошибки API (rate limits, invalid requests)
   - Ошибки парсинга ответа

4. **Timeout Errors** (504):
   - Запрос к OpenAI превысил 60 секунд

---

## Prompt Construction

**Template Structure**:
```
Дилемма: {dilemma.title}
Описание: {dilemma.description}

Вариант A: {dilemma.option_a_title}
{dilemma.option_a_description}

Вариант B: {dilemma.option_b_title}
{dilemma.option_b_description}

Ответ пользователя: {choice} ({choice === 'A' ? dilemma.option_a_title : dilemma.option_b_title})

[Если reasoning предоставлено:]
Размышления пользователя: {reasoning}

[Промпт AI ассистента с инструкциями]
```

**Note**: Промпт AI ассистента уже настроен в Assistant ID `asst_8GvBqeGy2jXoklcWS8OmgQE8`, поэтому система передает только данные дилемы, выбора и размышлений.

---

## State Management

**Stateless Operation**: Модуль не сохраняет состояние запросов. Каждый запрос независим и может быть выполнен многократно для одного и того же выбора.

**No Database Tables**: Модуль не требует создания новых таблиц или миграций.

**Caching**: Не требуется (stateless, real-time processing).

---

## Validation Summary

| Field | Type | Required | Max Length | Validation |
|-------|------|----------|------------|------------|
| dilemmaName | string | Yes | - | Must exist in database, must be active |
| choice | 'A' \| 'B' | Yes | - | Enum validation |
| reasoning | string | No | 5000 | Optional, max 5000 chars |

---

## API Contract Summary

**Endpoint**: `POST /api/feedback/analyze`

**Request**:
- Headers: `X-User-UUID: string` (required)
- Body: `FeedbackRequestDto`

**Response**:
- Success (200): `FeedbackResponseDto`
- Errors:
  - 400: Validation error
  - 404: Dilemma not found or inactive
  - 500: OpenAI API error
  - 504: Timeout
