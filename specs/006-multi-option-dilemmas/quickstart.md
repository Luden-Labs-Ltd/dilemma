# Quick Start: Multi-Option Dilemmas (006)

## Overview

Расширение API для дилем с 2–10 вариантами ответа. Детали дилемы возвращают массив `options`; выбор и финальное решение принимают букву A–J; статистика — объект `pathCounts` с динамическими ключами траекторий.

## Prerequisites

- Backend: NestJS, PostgreSQL, миграция с полем `options_count` (2..10) в `dilemmas`.
- i18n: ключи `option_c_title`, `option_c_description`, `feedback_c` (и при необходимости d..j) в `dilemmas.{name}` для дилем с 3+ вариантами.

## Base URL

```
http://localhost:3000/api
```

## Quick API Reference (changes)

### 1. Get Dilemma Details (options array)

```http
GET /api/dilemmas/{name}
Accept-Language: he
X-User-UUID: {uuid}  (optional)
```

**Response** (2-вариантная дилема — без изменений по смыслу, формат options):

```json
{
  "name": "medical",
  "title": "...",
  "description": "...",
  "options": [
    { "id": "A", "title": "...", "description": "..." },
    { "id": "B", "title": "...", "description": "..." }
  ],
  "hasParticipated": false
}
```

**Response** (3-вариантная дилема):

```json
{
  "name": "three_way",
  "title": "...",
  "description": "...",
  "options": [
    { "id": "A", "title": "...", "description": "..." },
    { "id": "B", "title": "...", "description": "..." },
    { "id": "C", "title": "...", "description": "..." }
  ],
  "hasParticipated": false
}
```

### 2. Submit Initial Choice (A, B, or C..J)

```http
POST /api/decisions/initial
Content-Type: application/json
X-User-UUID: {uuid}
Accept-Language: he
```

**Request** (3-вариантная дилема):

```json
{
  "dilemmaName": "three_way",
  "choice": "C"
}
```

**Response**: `201` — `{ "decisionId": 1, "feedback": "..." }` (фидбэк для выбранного варианта).

**Errors**: `400` — недопустимый выбор для данной дилемы; `409` — пользователь уже участвовал.

### 3. Submit Final Choice (A, B, or C..J)

```http
POST /api/decisions/final
Content-Type: application/json
X-User-UUID: {uuid}
```

**Request**:

```json
{
  "dilemmaName": "three_way",
  "choice": "A"
}
```

**Response**: `200` — `{ "decisionId": 1, "initialChoice": "C", "finalChoice": "A", "changedMind": true, "path": "CA", "timeToDecide": 42 }`.

### 4. Get Path Statistics (dynamic pathCounts)

```http
GET /api/statistics/dilemma/{name}
```

**Response** (3-вариантная дилема):

```json
{
  "pathCounts": {
    "AA": 5, "AB": 2, "AC": 1,
    "BA": 3, "BB": 4, "BC": 0,
    "CA": 1, "CB": 0, "CC": 2
  },
  "totalCompleted": 18
}
```

Для 2-вариантной дилемы — только ключи AA, AB, BA, BB.

## Local Run (after implementation)

1. Применить миграцию: `options_count` в `dilemmas`, CHECK для choice в `user_decisions` (опционально).
2. Добавить в i18n (en/he/ru) ключи для одной тестовой дилемы с 3 вариантами (option_c_*, feedback_c).
3. Запустить backend: `cd backend-dilemma && pnpm run start:dev`.
4. Проверить: GET dilemmas (единый список), GET dilemmas/three_way (options.length === 3), POST initial choice C, POST final choice A, GET statistics/dilemma/three_way (pathCounts.CA и др.).

## Contracts

Полные схемы и пути — в [contracts/api-spec.json](./contracts/api-spec.json).
