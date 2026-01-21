# Quick Start: Система дилем API

## Overview

REST API для системы этических дилем. Пользователи делают выбор, получают фидбэк, и могут изменить решение.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Идентификация через заголовок:
```
X-User-UUID: {uuid}
```

UUID генерируется на фронтенде.

## Quick API Reference

### 1. Get List of Dilemmas
```http
GET /api/dilemmas
```

**Response**:
```json
[
  {
    "name": "dilemma1",
    "title": "Этическая дилема: Тележка",
    "description": "Вагонетка несется по рельсам...",
    "participantCount": 1000
  }
]
```

### 2. Get Dilemma Details
```http
GET /api/dilemmas/dilemma1
X-User-UUID: 123e4567-e89b-12d3-a456-426614174000
```

**Response**:
```json
{
  "name": "dilemma1",
  "title": "Этическая дилема: Тележка",
  "description": "...",
  "optionA": {
    "title": "Переключить стрелку",
    "description": "Убить 1, спасти 5"
  },
  "optionB": {
    "title": "Не вмешиваться",
    "description": "Убить 5, спасти 1"
  },
  "hasParticipated": false
}
```

### 3. Make Initial Choice
```http
POST /api/decisions/initial
X-User-UUID: 123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "dilemmaName": "dilemma1",
  "choice": "A"
}
```

**Response**:
```json
{
  "decisionId": 123,
  "feedback": "Вы стали активным участником и взяли ответственность..."
}
```

### 4. Make Final Choice
```http
POST /api/decisions/final
X-User-UUID: 123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "dilemmaName": "dilemma1",
  "choice": "B"
}
```

**Response**:
```json
{
  "decisionId": 123,
  "initialChoice": "A",
  "finalChoice": "B",
  "changedMind": true,
  "path": "AB",
  "timeToDecide": 45
}
```

### 5. Get My Decisions
```http
GET /api/decisions/my
X-User-UUID: 123e4567-e89b-12d3-a456-426614174000
```

**Response**:
```json
[
  {
    "dilemmaName": "dilemma1",
    "dilemmaTitle": "Этическая дилема: Тележка",
    "initialChoice": "A",
    "finalChoice": "B",
    "changedMind": true,
    "path": "AB",
    "participatedAt": "2024-01-15T10:30:00Z",
    "timeToDecide": 45
  }
]
```

### 6. Get Statistics
```http
GET /api/statistics/dilemma/dilemma1
```

**Response**:
```json
{
  "dilemma": {
    "name": "dilemma1",
    "title": "Этическая дилема: Тележка"
  },
  "totalParticipants": 1000,
  "stats": {
    "AA": 300,
    "AB": 150,
    "BB": 400,
    "BA": 150
  },
  "paths": [
    {
      "name": "AA",
      "count": 300,
      "percentage": 30,
      "description": "Выбрали А и остались на А"
    }
  ],
  "changeRate": 30,
  "avgTimeToDecide": 45.5
}
```

## User Flow Example

1. **Get dilemmas**: `GET /api/dilemmas`
2. **View dilemma**: `GET /api/dilemmas/dilemma1`
3. **Make initial choice**: `POST /api/decisions/initial` with `choice: "A"`
4. **Read feedback** (from response)
5. **Make final choice**: `POST /api/decisions/final` with `choice: "B"` (changed mind)
6. **View results**: `GET /api/decisions/my` and `GET /api/statistics/dilemma/dilemma1`

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["choice must be either 'A' or 'B'"]
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Dilemma not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User has already participated in this dilemma"
}
```

## Business Rules

- One user = one participation per dilemma
- Must make initial choice before final choice
- Cannot change final choice after it's set
- Statistics include only completed participations (with final_choice)
