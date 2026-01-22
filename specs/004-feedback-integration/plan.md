# Implementation Plan: Интеграция AI-фидбэка на фронтенде

**Branch**: `004-feedback-integration` | **Date**: 2026-01-22 | **Spec**: `specs/004-feedback-integration/spec.md`

## Summary

Интегрировать вызов `POST /api/feedback/analyze` во фронтенд: добавить функцию в API-клиент, вызывать её на странице инсайтов, отображать контраргументы и обрабатывать ошибки. Бэкенд не меняется.

## Technical Context

- **Stack**: TypeScript, React, Vite, i18next (frontend-dilemma). API-клиент в `frontend-dilemma/src/shared/lib/api.ts`.
- **Constraints**: Использовать существующие `request`, `getClientUuid`, `X-User-UUID`; не менять backend.

## Project Structure

- `frontend-dilemma/src/shared/lib/api.ts` — добавить `fetchFeedbackAnalyze`.
- `frontend-dilemma/src/pages/InsightPage.tsx` — вызов API, блок контраргументов, loading/error/retry.
- `frontend-dilemma/src/shared/i18n/locales/{en,he}/translation.json` — ключи для блока AI-фидбэка.

## Phases

1. **API**: Реализовать `fetchFeedbackAnalyze` в `api.ts`.
2. **i18n**: Добавить ключи `insight.aiFeedback.*` (en + he).
3. **UI**: Интегрировать в `InsightPage` — запрос, блок, обработка ошибок.

## Dependencies

- 001-connect-backend (API-клиент, UUID, InsightPage) уже реализован.
