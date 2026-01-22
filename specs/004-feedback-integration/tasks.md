# Tasks: Интеграция AI-фидбэка на фронтенде

**Input**: `specs/004-feedback-integration/spec.md`, `plan.md`, `contracts/README.md`

## Format

- `[P]` — можно выполнять параллельно с другими задачами того же типа.
- В описании указаны пути к файлам.

---

## Phase 1: API & Types

**Purpose**: Добавить вызов `POST /api/feedback/analyze` в API-клиент.

- [x] T001 Добавить функцию `fetchFeedbackAnalyze(dilemmaName, choice, reasoning?)` в `frontend-dilemma/src/shared/lib/api.ts`: `POST /feedback/analyze`, заголовок `X-User-UUID`, body `{ dilemmaName, choice, reasoning? }`. Возвращать `Promise<string[]>` (`counterArguments`).

---

## Phase 2: i18n

**Purpose**: Ключи для блока AI-контраргументов и ошибок.

- [x] T002 [P] Добавить в `frontend-dilemma/src/shared/i18n/locales/en/translation.json` ключи: `insight.aiFeedback.title`, `insight.aiFeedback.loading`, `insight.aiFeedback.error`, `insight.aiFeedback.retry`, `insight.aiFeedback.empty`
- [x] T003 [P] Добавить те же ключи в `frontend-dilemma/src/shared/i18n/locales/he/translation.json` с Hebrew переводами

---

## Phase 3: InsightPage Integration

**Purpose**: Вызывать AI-фидбэк на странице инсайтов, показывать контраргументы, обрабатывать ошибки.

- [x] T004 В `frontend-dilemma/src/pages/InsightPage.tsx`: после успешной загрузки `getInsightData` вызывать `fetchFeedbackAnalyze(currentDilemma, choice as 'A'|'B', reasonText || undefined)`. Хранить `counterArguments`, `aiFeedbackLoading`, `aiFeedbackError` в state.
- [x] T005 Отображать блок «AI-контраргументы» на `InsightPage`: заголовок (`insight.aiFeedback.title`), при loading — `insight.aiFeedback.loading`, при error — сообщение + кнопка retry (`insight.aiFeedback.retry`), при успехе — список пунктов. Если массив пустой — показывать `insight.aiFeedback.empty`. Разместить блок между «Интерпретация» и кнопкой «Back to dilemmas».
- [x] T006 Обеспечить повторный запрос AI-фидбэка по кнопке retry без перезагрузки остальных данных инсайта.

---

## Dependencies

- Phase 1 → Phase 2, 3.
- Phase 2 и 3 (T004–T006) зависят от T001.

## Validation

- Пройти дилемму до Insight, убедиться что блок контраргументов загружается и отображается.
- Симулировать 5xx/таймаут (e.g. через DevTools) — проверить сообщение об ошибке и retry.
