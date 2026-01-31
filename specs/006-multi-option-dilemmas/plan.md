# Implementation Plan: Несколько вариантов ответа на дилемы (A, B, C и более)

**Branch**: `006-multi-option-dilemmas` | **Date**: 2025-01-30 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-multi-option-dilemmas/spec.md`

**Note**: This plan is filled in by the `/speckit.plan` command.

## Summary

Поддержка переменного числа вариантов ответа на дилему: минимум 2, максимум 10. На первом этапе — 2 и 3 варианта (A, B, C). Варианты идентифицируются буквами A–J; подписи и фидбэк локализуются через i18n. Список дилем — единый; выбор и финальное решение валидируются по набору вариантов дилемы; траектории (path) и статистика учитывают все комбинации initial → final. Обратная совместимость: существующие 2-вариантные дилемы и исторические решения без изменений. После появления хотя бы одного решения по дилеме набор вариантов не изменяется.

## Technical Context

**Language/Version**: TypeScript 5.7+ (strict mode)  
**Primary Dependencies**: NestJS 11.x, TypeORM, class-validator, nestjs-i18n  
**Storage**: PostgreSQL (dilemmas, user_decisions)  
**Testing**: Jest (unit), E2E for API endpoints  
**Target Platform**: Linux server (backend), web (frontend)  
**Project Type**: web (backend-dilemma + frontend-dilemma)  
**Performance Goals**: Статистика с кэшем TTL 5 мин; ответы API &lt;200ms p95  
**Constraints**: Макс. 10 вариантов на дилему; валидация выбора по набору вариантов дилемы  
**Scale/Scope**: Существующие дилемы + новые 2–3-вариантные; траектории 2–100 (2–10 вариантов)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|------|
| I. NestJS Modular Architecture | Pass | Изменения в модулях dilemmas, decisions, statistics; без новых модулей |
| II. TypeScript First | Pass | Строгие типы, интерфейсы для DTO/entities |
| III. Test-First Development | Pass | Unit для сервисов (валидация выбора, path stats); E2E для endpoints |
| IV. RESTful API Design | Pass | Существующие пути; расширение тел/ответов (options array, pathCounts) |
| V. Data Validation & Security | Pass | class-validator для choice (IsIn по вариантам дилемы); UUID для user |
| Technology Stack | Pass | NestJS, TypeORM, PostgreSQL, class-validator, nestjs-i18n |
| Naming / File Organization | Pass | kebab-case, DTO/entities в существующих папках |
| API Versioning | Pass | Без смены версии; обратная совместимость по контракту |
| Error Handling | Pass | 400 при недопустимом выборе; 409 при повторном initial/final |

## Project Structure

### Documentation (this feature)

```text
specs/006-multi-option-dilemmas/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI snippets)
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend-dilemma/
├── src/
│   ├── modules/
│   │   ├── dilemmas/       # options_count, options array in DTO, i18n for C..J
│   │   ├── decisions/      # choice A..J, validate against dilemma.options_count
│   │   └── statistics/     # dynamic path counts (AA..JJ)
│   ├── i18n/               # en/he/ru dilemmas.json — keys option_c_*, feedback_c
│   └── main.ts
└── test/

frontend-dilemma/
├── src/
│   ├── pages/              # render N options from API
│   └── services/           # API client for options array, choice
└── ...
```

**Structure Decision**: Монорепо с backend-dilemma (NestJS) и frontend-dilemma. Фича затрагивает модули dilemmas, decisions, statistics и i18n; новый код — в существующих модулях.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Нет нарушений — таблица не заполняется.
