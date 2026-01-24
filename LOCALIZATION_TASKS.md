# Tasks: Синхронизация локализации Frontend-Backend (he/en)

## Цель
Обеспечить корректное отображение всех текстов с правильными ключами локализации и синхронизацию между фронтендом и бэкендом для иврита и английского языков.

## Обнаруженные проблемы

### Критические:
1. **Несоответствие имён дилемм**: Backend отдаёт `trolley-problem`, `privacy-vs-security`, `ai-autonomy`, а Frontend использует `medical`, `professional`, `state`
2. **Frontend не использует данные от Backend**: `useDilemmaData` игнорирует API данные и использует только локальные ключи локализации
3. **Дублирование контента**: Дилеммы определены и на Backend (i18n), и на Frontend (translation.json)

### Средние:
4. **Отсутствие синхронизации ключей**: Frontend имеет больше ключей локализации, чем Backend
5. **Некорректная структура**: Backend возвращает `title`, `description`, `option_a_title`, но Frontend ожидает вложенную структуру

---

## Phase 1: Анализ и планирование (Setup)

- [ ] T001 Создать документ сравнения ключей локализации Frontend vs Backend
- [ ] T002 Определить единую стратегию: использовать Backend как источник истины или Frontend
- [ ] T003 Создать маппинг между текущими именами дилемм (migration guide)

---

## Phase 2: Синхронизация имён дилемм (US1)

**User Story 1**: Как пользователь, я хочу видеть корректные дилеммы с правильными переводами

### Backend изменения:
- [ ] T004 [US1] Обновить имена дилемм в `backend-dilemma/src/i18n/he/dilemmas.json` на `medical`, `professional`, `state`
- [ ] T005 [US1] Обновить имена дилемм в `backend-dilemma/src/i18n/en/dilemmas.json` на `medical`, `professional`, `state`
- [ ] T006 [US1] Обновить имена дилемм в `backend-dilemma/src/i18n/ru/dilemmas.json` на `medical`, `professional`, `state`
- [ ] T007 [US1] Обновить seed данные в `backend-dilemma/src/modules/dilemmas/dilemmas.service.ts` (метод `seedDilemmas`)

### Тестирование:
- [ ] T008 [US1] Проверить GET `/api/dilemmas` возвращает дилеммы с новыми именами
- [ ] T009 [US1] Проверить POST `/api/decisions/initial` работает с новыми именами
- [ ] T010 [US1] Проверить POST `/api/feedback/analyze` работает с новыми именами

---

## Phase 3: Согласование структуры данных (US2)

**User Story 2**: Как разработчик, я хочу единую структуру данных между Frontend и Backend

### Backend расширение API:
- [ ] T011 [P] [US2] Добавить поля `subtitle`, `questionText`, `reflectionText` в `backend-dilemma/src/modules/dilemmas/entities/dilemma.entity.ts`
- [ ] T012 [P] [US2] Обновить DTO `backend-dilemma/src/modules/dilemmas/dto/dilemma-details.dto.ts`
- [ ] T013 [US2] Обновить seed данные для добавления новых полей
- [ ] T014 [US2] Обновить i18n файлы (he/en/ru) с дополнительными полями

### Frontend изменения:
- [ ] T015 [P] [US2] Удалить дублирующие ключи `dilemmas.*` из `frontend-dilemma/src/shared/i18n/locales/he/translation.json`
- [ ] T016 [P] [US2] Удалить дублирующие ключи `dilemmas.*` из `frontend-dilemma/src/shared/i18n/locales/en/translation.json`
- [ ] T017 [US2] Обновить `frontend-dilemma/src/shared/hooks/useDilemmaData.ts` для использования данных от API
- [ ] T018 [US2] Создать новый хук `useDilemmaDetails` для получения данных от `/api/dilemmas/{name}`

### Тестирование:
- [ ] T019 [US2] Проверить отображение дилемм на всех страницах (DilemmaSelection, Choice, Stats, Insight)
- [ ] T020 [US2] Переключить язык с he на en и проверить корректность всех текстов

---

## Phase 4: Sources/Materials локализация (US3)

**User Story 3**: Как пользователь, я хочу видеть источники на выбранном языке

### Backend расширение:
- [ ] T021 [P] [US3] Добавить таблицу `dilemma_sources` в `backend-dilemma/src/modules/dilemmas/entities/`
- [ ] T022 [P] [US3] Создать endpoint GET `/api/dilemmas/{name}/sources`
- [ ] T023 [US3] Добавить источники в i18n файлы (he/en/ru)
- [ ] T024 [US3] Обновить seed данные для загрузки источников

### Frontend изменения:
- [ ] T025 [P] [US3] Обновить `frontend-dilemma/src/shared/lib/api.ts` - добавить `fetchDilemmaSources`
- [ ] T026 [P] [US3] Обновить `useDilemmaData` для получения sources от API
- [ ] T027 [US3] Проверить отображение sources на странице

### Тестирование:
- [ ] T028 [US3] Проверить корректность источников на иврите и английском

---

## Phase 5: Проверка RTL и иврита (US4)

**User Story 4**: Как израильский пользователь, я хочу правильно отображенный интерфейс на иврите

### Frontend проверка:
- [ ] T029 [P] [US4] Проверить RTL layout на всех страницах в режиме иврита
- [ ] T030 [P] [US4] Проверить правильность переводов всех UI элементов (кнопки, заголовки, плейсхолдеры)
- [ ] T031 [P] [US4] Проверить отображение длинных текстов на мобильных устройствах
- [ ] T032 [US4] Исправить проблемы с выравниванием текста (text-align для RTL)

### Backend проверка:
- [ ] T033 [P] [US4] Проверить корректность всех переводов в `backend-dilemma/src/i18n/he/dilemmas.json`
- [ ] T034 [P] [US4] Проверить грамматику и стиль ивритских текстов
- [ ] T035 [US4] Добавить тесты для проверки наличия всех ключей локализации

---

## Phase 6: Английская локализация (US5)

**User Story 5**: Как англоязычный пользователь, я хочу качественные переводы

### Проверка переводов:
- [ ] T036 [P] [US5] Проверить все английские переводы в `backend-dilemma/src/i18n/en/dilemmas.json`
- [ ] T037 [P] [US5] Проверить все английские переводы в `frontend-dilemma/src/shared/i18n/locales/en/translation.json`
- [ ] T038 [P] [US5] Исправить неточности и improve fluency
- [ ] T039 [US5] Проверить консистентность терминологии (Option A/B, dilemma, choice, etc.)

### Тестирование:
- [ ] T040 [US5] Пройти весь flow на английском языке и проверить все страницы
- [ ] T041 [US5] Проверить переключение языка he ↔ en без перезагрузки страницы

---

## Phase 7: Финальная интеграция и тестирование (US6)

**User Story 6**: Как разработчик, я уверен что вся система работает корректно

### E2E тестирование:
- [ ] T042 [P] [US6] Создать E2E тест для flow на иврите (выбор дилеммы → choice → reason → insight)
- [ ] T043 [P] [US6] Создать E2E тест для flow на английском
- [ ] T044 [P] [US6] Проверить переключение языка в середине flow
- [ ] T045 [US6] Проверить что Backend возвращает язык согласно Accept-Language header

### Документация:
- [ ] T046 [P] [US6] Создать документ "Localization Guide" для разработчиков
- [ ] T047 [P] [US6] Документировать структуру ключей локализации
- [ ] T048 [US6] Добавить примеры добавления новой дилеммы с переводами

### Cleanup:
- [ ] T049 [P] [US6] Удалить неиспользуемые ключи локализации
- [ ] T050 [P] [US6] Удалить русскую локализацию если не нужна (или завершить её)
- [ ] T051 [US6] Обновить README с информацией о поддерживаемых языках

---

## Dependency Graph

```
Setup (T001-T003)
    ↓
US1: Sync Names (T004-T010)
    ↓
US2: Data Structure (T011-T020)
    ↓
US3: Sources (T021-T028)
    ↓
US4: Hebrew Check (T029-T035) ← Can run in parallel with US5
    ↓                               ↓
US5: English Check (T036-T041)  ←←←┘
    ↓
US6: Integration (T042-T051)
```

---

## Parallel Execution Opportunities

- **Phase 2**: T004-T006 (обновление разных языковых файлов)
- **Phase 3**: T011-T012 (Backend), T015-T016 (Frontend) - независимые изменения
- **Phase 4**: T021-T022 (Backend), T025-T026 (Frontend)
- **Phase 5 & 6**: US4 и US5 могут выполняться параллельно
- **Phase 7**: T042-T044, T046-T048, T049-T051 - независимые задачи

---

## Implementation Strategy

**MVP (Minimum Viable Product)**: 
- US1 (синхронизация имён) + US2 (структура данных) = базовая работающая система

**Incremental Delivery**:
1. MVP → Deploy → Test
2. US3 (sources) → Deploy → Test
3. US4 + US5 (качество переводов) → Deploy → Test
4. US6 (финализация) → Deploy

---

## Success Criteria

✅ Все тексты отображаются на правильном языке (he/en)
✅ Нет missing translation keys или fallback значений
✅ Backend и Frontend используют одинаковые имена дилемм
✅ RTL корректно работает для иврита
✅ Переключение языка работает без багов
✅ Все E2E тесты проходят на обоих языках

---

**Total Tasks**: 51
**Estimated Time**: 3-4 дня (с учётом тестирования)
