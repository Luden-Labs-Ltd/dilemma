# Implementation Plan: Расширение контекста для AI-фидбэка

**Branch**: `005-enhance-ai-context` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-enhance-ai-context/spec.md`

## Summary

Расширение функциональности AI-фидбэка для улучшения качества анализа за счет включения дополнительного контекста. Клиент передает переводы дилеммы на текущем языке пользователя и оригинальный английский текст в теле запроса. Backend использует оба варианта текста для построения расширенного промпта, который отправляется в OpenAI Assistant. Это позволяет AI лучше понимать нюансы дилеммы и генерировать более качественные контраргументы.

## Technical Context

**Language/Version**: TypeScript 5.7+ (strict mode), NestJS 11.x  
**Primary Dependencies**: NestJS, class-validator, class-transformer, nestjs-i18n, OpenAI SDK  
**Storage**: N/A (stateless operation, использует существующие данные из i18n)  
**Testing**: Jest (unit tests), Supertest (E2E tests)  
**Target Platform**: Node.js backend server  
**Project Type**: Backend API extension (NestJS module)  
**Performance Goals**: Без деградации существующей производительности (< 20 секунд на запрос)  
**Constraints**: Промпт не должен превышать лимиты токенов OpenAI модели, обратная совместимость с существующими запросами  
**Scale/Scope**: Расширение существующего модуля feedback, поддержка 3 языков (he, en, ru)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ NestJS Modular Architecture
- Расширение существующего модуля `feedback` без создания новых модулей
- Соблюдение принципов dependency injection
- Модуль остается самодостаточным и тестируемым

### ✅ TypeScript First
- Все изменения в TypeScript с strict mode
- Использование интерфейсов для DTOs
- Явные типы для всех методов

### ✅ Test-First Development
- TDD для новой логики построения промпта
- Unit тесты для `buildPrompt` метода
- E2E тесты для обновленного endpoint

### ✅ RESTful API Design
- Расширение существующего `POST /api/feedback/analyze` endpoint
- Обратная совместимость с существующими запросами
- Документация через Swagger/OpenAPI

### ✅ Data Validation & Security
- Валидация новых полей через class-validator
- Опциональные поля с fallback логикой
- Валидация структуры вложенных объектов

## Project Structure

### Documentation (this feature)

```text
specs/005-enhance-ai-context/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend-dilemma/
├── src/
│   ├── modules/
│   │   └── feedback/
│   │       ├── dto/
│   │       │   ├── feedback-request.dto.ts      # Расширение с dilemmaText и dilemmaTextOriginal
│   │       │   └── feedback-response.dto.ts     # Без изменений
│   │       ├── feedback.controller.ts           # Без изменений (валидация через DTO)
│   │       ├── feedback.service.ts              # Обновление buildPrompt метода
│   │       └── feedback.module.ts               # Без изменений
│   └── ...
└── tests/
    └── modules/
        └── feedback/
            ├── feedback.service.spec.ts         # Обновление unit тестов
            └── feedback.e2e-spec.ts             # Обновление E2E тестов
```

**Structure Decision**: Расширение существующего модуля feedback без изменения архитектуры. Новые DTOs для передачи переводов, обновление логики построения промпта в сервисе.

## Complexity Tracking

> **No violations detected** - расширение существующего модуля без добавления сложности
