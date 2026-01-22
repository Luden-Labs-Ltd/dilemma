# Feature Specification: Интеграция AI-фидбэка на фронтенде

**Feature Branch**: `004-feedback-integration`  
**Created**: 2026-01-22  
**Status**: Draft  
**Input**: Подключить фронтенд к эндпоинту `POST /api/feedback/analyze` (backend 003-ai-feedback). Пользователь видит контраргументы AI на странице инсайтов после финального выбора.

## User Scenarios & Testing

### User Story 1 - Отображение AI-контраргументов на Insight (Priority: P1)

Пользователь прошёл дилемму (initial → final choice, с объяснением или без). На странице «Personal insight» фронтенд вызывает `POST /api/feedback/analyze` с дилеммой, выбором и reasoning, получает массив контраргументов и отображает их отдельным блоком.

**Acceptance Scenarios**:

1. **Given** пользователь на странице инсайтов с выбором и опциональным объяснением, **When** данные загружены, **Then** фронтенд запрашивает AI-фидбэк и показывает блок «Почему твой выбор может быть неправильным» со списком контраргументов.
2. **Given** пользователь не дал объяснения (skipped), **When** запрос к `/api/feedback/analyze` отправляется, **Then** в body передаётся только `dilemmaName` и `choice`, без `reasoning`.
3. **Given** запрос к AI возвращает ошибку (5xx, таймаут, сеть), **When** фронтенд обрабатывает ответ, **Then** показывается понятное сообщение и кнопка «Повторить»; остальной контент инсайта (выбор, статистика, интерпретация) остаётся доступен, блок контраргументов — в состоянии ошибки или скрыт с retry.

## Requirements

### Functional Requirements

- **FR-001**: Frontend MUST вызывать `POST /api/feedback/analyze` с `dilemmaName`, `choice` (A|B), опционально `reasoning`, и заголовком `X-User-UUID`.
- **FR-002**: Frontend MUST отображать массив `counterArguments` от API в UI на странице инсайтов (блок с заголовком и списком пунктов).
- **FR-003**: Frontend MUST обрабатывать ошибки вызова (сеть, 4xx, 5xx, таймаут): показывать сообщение и возможность повторить запрос, не ломая отображение остальных данных инсайта.

### Key Entities

- **API**: `POST /api/feedback/analyze` (см. `contracts/README.md`). Request: `{ dilemmaName, choice, reasoning? }`. Response: `{ counterArguments: string[] }`.

## Success Criteria

- Пользователь видит блок AI-контраргументов на странице инсайтов при успешном ответе API.
- При сбое API блок показывает ошибку и «Повторить»; остальная страница работает.

## Assumptions

- Backend `POST /api/feedback/analyze` доступен (production Railway). Контракт описан в Swagger и в `specs/003-ai-feedback`.
- Идентификатор пользователя (`X-User-UUID`) уже есть на фронте (001-connect-backend).
