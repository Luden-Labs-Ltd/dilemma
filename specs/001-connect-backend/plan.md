# Implementation Plan: Подключение фронтенда к API дилемм

**Branch**: `001-connect-backend` | **Date**: 2026-01-21 | **Spec**: `specs/001-connect-backend/spec.md`  
**Input**: Feature specification из `specs/001-connect-backend/spec.md`

## Summary

Цель фичи — перевести фронтенд на работу с живым backend‑API дилемм вместо локально захардкоженных данных, обеспечив согласованность состояния (дилемы, решения, статистика) между браузером и сервером и устойчивое поведение при сбоях API. Технически это достигается конфигурируемым base URL для API, обёрткой над HTTP‑клиентом, использованием существующего контракта backend‑API и централизованной обработкой ошибок и идентификатора пользователя.

## Technical Context

**Language/Version**: Frontend — TypeScript ~5.9 + React 19; Backend — TypeScript ^5.7 + NestJS 11  
**Primary Dependencies**: Frontend — React, React Router, Vite, i18next; Backend — NestJS, TypeORM, PostgreSQL, @nestjs/swagger  
**Storage**: PostgreSQL (backend), локальное хранилище в браузере для идентификатора пользователя  
**Testing**: Backend — Jest (unit + e2e по конституции); Frontend — ESLint/TS‑check, опционально unit/интеграционные тесты на React (может быть добавлено в рамках реализации)  
**Target Platform**: Backend — Linux server (Railway); Frontend — современные браузеры (desktop/mobile)  
**Project Type**: web (monorepo с `backend-dilemma` и `frontend-dilemma`)  
**Performance Goals**: См. SC‑001–SC‑004 в спеки: загрузка списка дилем < 3 секунд для 95% пользователей, успешное завершение полного флоу не менее чем в 90% случаев и отсутствие рассинхронизации состояний  
**Constraints**: Соблюдение REST‑контрактов backend‑API, отсутствие изменения бизнес‑логики на сервере в этой фиче, сохранение UX и i18n на фронтенде  
**Scale/Scope**: Интеграция только существующих флоу дилем (список, детали, initial/final choice, статистика) без расширения доменной модели

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **NestJS Modular Architecture**: Фича не добавляет новых backend‑модулей, а использует уже существующие (`dilemmas`, `decisions`, `statistics`, `users`); границы модулей не нарушаются.  
- **TypeScript First**: Backend уже на TypeScript со strict‑настройками; новая фронтенд‑логика будет также на TypeScript без `any`.  
- **Test-First Development**: Для любых правок backend (если появятся) обязателен TDD; для текущей фичи планируется работать только на фронтенде, не нарушая существующие тесты.  
- **RESTful API Design**: Используем уже определённые REST‑ендпоинты без изменения URL/методов, только интеграция на фронте.  
- **Data Validation & Security**: Валидация и безопасность продолжают обеспечиваться на backend; фронт не обходит проверки и всегда ходит через публичные API.

**Gate Decision**: Нарушений конституции не планируется; фича ограничивается фронтенд‑интеграцией с уже существующим REST‑API, Phase 0 и Phase 1 можно выполнять.

## Project Structure

### Documentation (this feature)

```text
specs/001-connect-backend/
├── plan.md              # Этот файл (/speckit.plan)
├── research.md          # Phase 0: решения по интеграции фронтенда с API
├── data-model.md        # Phase 1: фронтенд-ориентированная модель данных поверх API
├── quickstart.md        # Phase 1: как поднять и связать фронт с backend
├── contracts/           # Phase 1: привязка к существующему OpenAPI и используемым эндпоинтам
└── tasks.md             # Phase 2: создаётся через /speckit.tasks (не в рамках /speckit.plan)
```

### Source Code (repository root)

```text
backend-dilemma/
├── src/
│   ├── modules/
│   │   ├── dilemmas/
│   │   ├── decisions/
│   │   ├── statistics/
│   │   └── users/
│   └── common/
└── test/
    ├── e2e/
    └── unit/

frontend-dilemma/
├── src/
│   ├── app/
│   │   ├── entrypoint/
│   │   ├── routes/
│   │   ├── layout/
│   │   └── context/
│   ├── pages/
│   └── shared/
│       ├── hooks/
│       ├── lib/
│       └── ui/
└── public/
```

**Structure Decision**: Используем существующую двухкомпонентную структуру (`backend-dilemma` + `frontend-dilemma`), вся реализация фичи выполняется во `frontend-dilemma` (новые/изменённые хуки, контекст и утилиты API) без изменения модульной архитектуры NestJS в `backend-dilemma`.

## Complexity Tracking

На данный момент дополнительных источников сложности (новый сервис, новый тип хранилища, отдельный проект) не планируется, ожидается работа в рамках существующей архитектуры фронтенда и backend‑API. Если в реализации появится необходимость изменять backend или вводить дополнительные уровни абстракции, этот раздел будет дополнен.

