# Data Model: Расширение контекста для AI-фидбэка

**Feature**: `005-enhance-ai-context`  
**Date**: 2026-01-26  
**Phase**: 1 - Design & Contracts

## Overview

Расширение существующего DTO FeedbackRequestDto для поддержки передачи переводов дилеммы от клиента. Модуль остается stateless - не требует изменений в базе данных или новых сущностей.

## DTOs (Data Transfer Objects)

### DilemmaTextDto

**Purpose**: Представляет структуру текста дилеммы (перевод или оригинал)

**Fields**:
- `title: string` (required)
  - Валидация: непустая строка
  - Пример: `"Strategic Silence"`
  
- `subtitle?: string` (optional)
  - Валидация: строка, может быть undefined
  - Пример: `"Military Dilemma"`
  
- `questionText?: string` (optional)
  - Валидация: строка, может быть undefined
  - Пример: `"What is your command?"`
  
- `description: string` (required)
  - Валидация: непустая строка
  - Пример: `"You are a commander in Unit 8200..."`
  
- `reflectionText?: string` (optional)
  - Валидация: строка, может быть undefined
  - Пример: `"Point to consider: Do you listen to the machine's mathematics..."`
  
- `options: { a: string, b: string }` (required)
  - Валидация: объект с обязательными полями a и b (непустые строки)
  - Пример: `{ a: "ADOPT MACHINE RECOMMENDATION\nSilence to Save Lives", b: "BROADCAST ALERT\nTruth at Any Cost" }`

**Validation Rules**:
- `title`: `@IsString()`, `@IsNotEmpty()`
- `subtitle`: `@IsString()`, `@IsOptional()`
- `questionText`: `@IsString()`, `@IsOptional()`
- `description`: `@IsString()`, `@IsNotEmpty()`
- `reflectionText`: `@IsString()`, `@IsOptional()`
- `options`: `@IsObject()`, `@ValidateNested()`, вложенный объект с `@IsString()`, `@IsNotEmpty()` для a и b

**Example**:
```typescript
{
  title: "Strategic Silence",
  subtitle: "Military Dilemma",
  questionText: "What is your command?",
  description: "You are a commander in Unit 8200...",
  reflectionText: "Point to consider: Do you listen to...",
  options: {
    a: "ADOPT MACHINE RECOMMENDATION\nSilence to Save Lives",
    b: "BROADCAST ALERT\nTruth at Any Cost"
  }
}
```

---

### FeedbackRequestDto (Extended)

**Purpose**: Расширение существующего DTO для поддержки передачи переводов дилеммы

**Existing Fields** (без изменений):
- `dilemmaName: string` (required)
- `choice: 'A' | 'B'` (required)
- `reasoning?: string` (optional, max 5000 chars)

**New Fields**:
- `dilemmaText?: DilemmaTextDto` (optional)
  - Валидация: объект DilemmaTextDto, опциональный
  - Описание: Перевод дилеммы на текущем языке пользователя
  - Если не передан, используется существующая логика с i18n
  
- `dilemmaTextOriginal?: DilemmaTextDto` (optional)
  - Валидация: объект DilemmaTextDto, опциональный
  - Описание: Оригинальный английский текст из translation.json
  - Если не передан, используется fallback логика

**Validation Rules**:
- `dilemmaText`: `@IsOptional()`, `@ValidateNested()`, `@Type(() => DilemmaTextDto)`
- `dilemmaTextOriginal`: `@IsOptional()`, `@ValidateNested()`, `@Type(() => DilemmaTextDto)`

**Example**:
```typescript
{
  dilemmaName: "trolley-problem",
  choice: "A",
  reasoning: "אני חושב שצריך להקשיב למכונה",
  dilemmaText: {
    title: "שקיפות או יציבות",
    subtitle: "דילמה צבאית",
    questionText: "מה הפקודה שלך?",
    description: "אתה מפקד ב-8200...",
    reflectionText: "נקודה למחשבה: האם אתה נשמע למתמטיקה...",
    options: {
      a: "אימוץ המלצת המכונה\nשתיקה להצלת חיים",
      b: "פרסום אזהרה\nאמת גם במחיר דמים"
    }
  },
  dilemmaTextOriginal: {
    title: "Strategic Silence",
    subtitle: "Military Dilemma",
    questionText: "What is your command?",
    description: "You are a commander in Unit 8200...",
    reflectionText: "Point to consider: Do you listen to...",
    options: {
      a: "ADOPT MACHINE RECOMMENDATION\nSilence to Save Lives",
      b: "BROADCAST ALERT\nTruth at Any Cost"
    }
  }
}
```

---

### FeedbackResponseDto

**Purpose**: Ответ с массивом контраргументов от AI (без изменений)

**Fields**:
- `counterArguments: string[]` (required)
  - Массив строк с контраргументами
  - Без изменений в структуре

---

## Internal Data Structures

### EnhancedPromptData

**Purpose**: Внутренняя структура для построения расширенного промпта

**Fields**:
- `userLanguageText?: DilemmaTextDto` - текст на языке пользователя из dilemmaText
- `originalEnglishText?: DilemmaTextDto` - оригинальный английский текст из dilemmaTextOriginal
- `fallbackText?: { title: string, description: string, ... }` - fallback данные из i18n (если новые поля не переданы)
- `choice: 'A' | 'B'` - выбор пользователя
- `reasoning?: string` - размышления пользователя
- `lang: string` - язык пользователя (he, en, ru)

**Usage**: Используется внутри FeedbackService.buildPrompt для построения промпта с учетом всех доступных данных.

---

## Validation Flow

1. **Request Validation** (class-validator):
   - Валидация базовых полей (dilemmaName, choice, reasoning)
   - Валидация dilemmaText (если передан)
   - Валидация dilemmaTextOriginal (если передан)
   - Валидация вложенных объектов options

2. **Business Logic Validation** (FeedbackService):
   - Проверка существования дилеммы
   - Определение источника данных (новые поля или fallback)
   - Построение промпта с учетом доступных данных

---

## State Transitions

N/A - модуль остается stateless, не требует управления состоянием.

---

## Relationships

- **FeedbackRequestDto** содержит опциональные **DilemmaTextDto** объекты
- **DilemmaTextDto** используется как для `dilemmaText`, так и для `dilemmaTextOriginal`
- Связь с существующей сущностью **Dilemma** через `dilemmaName` (без изменений)

---

## Migration Notes

- Обратная совместимость: существующие запросы без новых полей продолжают работать
- Постепенная миграция: клиенты могут обновляться по мере готовности
- Fallback логика: если новые поля не переданы, используется существующая логика с i18n
