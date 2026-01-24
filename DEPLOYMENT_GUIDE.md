# Инструкция по развёртыванию изменений локализации

## Дата: 2026-01-24
## Цель: Синхронизация имён дилемм Backend-Frontend + передача языка в AI

---

## ✅ Выполненные изменения

### Backend изменения:

1. **Переименование дилемм в i18n файлах:**
   - ✅ `backend-dilemma/src/i18n/he/dilemmas.json`
   - ✅ `backend-dilemma/src/i18n/en/dilemmas.json`
   - ✅ `backend-dilemma/src/i18n/ru/dilemmas.json`
   
   **Старые имена → Новые имена:**
   - `trolley-problem` → `medical`
   - `privacy-vs-security` → `professional`
   - `ai-autonomy` → `state`

2. **Обновление seed данных:**
   - ✅ `backend-dilemma/src/modules/dilemmas/dilemmas.service.ts`
   - Метод `seedDilemmas()` теперь использует новые имена

3. **Передача языка в AI:**
   - ✅ `backend-dilemma/src/modules/feedback/feedback.service.ts`
   - Добавлена инструкция `responseInstruction` в промпт
   - AI теперь получает явное указание отвечать на нужном языке (he/en/ru)

4. **Обновление примеров в Swagger:**
   - ✅ `backend-dilemma/src/modules/feedback/feedback.controller.ts`
   - Примеры используют новые имена дилемм

### Frontend изменения:

- ✅ `frontend-dilemma/src/shared/lib/api.ts` уже передаёт `Accept-Language` header
- ✅ Все API вызовы автоматически используют язык из localStorage

---

## 🚀 Развёртывание (Development)

### Вариант 1: Полный рестарт (РЕКОМЕНДОВАНО для dev)

Если у вас есть тестовые данные, которые можно потерять:

```bash
# 1. Остановить backend
cd /Users/apple/work/dilemma/backend-dilemma
# Остановите Docker или процесс

# 2. Удалить БД и пересоздать
docker-compose down -v  # если используете Docker
# ИЛИ вручную удалите БД PostgreSQL

# 3. Пересоздать БД
docker-compose up -d postgres
# Подождите 5 секунд

# 4. Запустить backend (seed автоматически применится)
npm run start:dev
# ИЛИ
docker-compose up backend

# 5. Проверить
curl http://localhost:3000/api/dilemmas \
  -H "X-User-UUID: test-uuid" \
  -H "Accept-Language: he"

# Должны вернуться дилеммы: medical, professional, state
```

### Вариант 2: Миграция существующих данных

Если у вас есть важные данные (решения пользователей):

```bash
# 1. Применить SQL миграцию
cd /Users/apple/work/dilemma/backend-dilemma

# Если используете Docker:
docker exec -i <postgres-container-id> psql -U postgres -d dilemma_db < migration-rename-dilemmas.sql

# Если локальный PostgreSQL:
psql -U postgres -d dilemma_db -f migration-rename-dilemmas.sql

# 2. Перезапустить backend
npm run start:dev

# 3. Проверить
curl http://localhost:3000/api/dilemmas \
  -H "X-User-UUID: test-uuid" \
  -H "Accept-Language: he"
```

---

## 🧪 Тестирование

### 1. Проверка имён дилемм

```bash
# GET /api/dilemmas (иврит)
curl http://localhost:3000/api/dilemmas \
  -H "X-User-UUID: test-uuid" \
  -H "Accept-Language: he"

# Ожидаемый результат:
# [
#   {"name": "medical", "title": "אתיקה רפואית", ...},
#   {"name": "professional", "title": "אתיקה מקצועית", ...},
#   {"name": "state", "title": "מדינה וחברה יהודית", ...}
# ]

# GET /api/dilemmas (английский)
curl http://localhost:3000/api/dilemmas \
  -H "X-User-UUID: test-uuid" \
  -H "Accept-Language: en"

# Ожидаемый результат:
# [
#   {"name": "medical", "title": "Medical Ethics", ...},
#   {"name": "professional", "title": "Professional Ethics", ...},
#   {"name": "state", "title": "State and Jewish Society", ...}
# ]
```

### 2. Проверка AI генерации с языком

```bash
# AI feedback на иврите
curl -X POST http://localhost:3000/api/feedback/analyze \
  -H "Content-Type: application/json" \
  -H "X-User-UUID: test-uuid" \
  -H "Accept-Language: he" \
  -d '{
    "dilemmaName": "medical",
    "choice": "A",
    "reasoning": "אני חושב שצריך לתת עדיפות למשפחה"
  }'

# Ответ должен быть массив строк НА ИВРИТЕ:
# {
#   "counterArguments": [
#     "טיעון נגדי בעברית 1",
#     "טיעון נגדי בעברית 2",
#     ...
#   ]
# }

# AI feedback на английском
curl -X POST http://localhost:3000/api/feedback/analyze \
  -H "Content-Type: application/json" \
  -H "X-User-UUID: test-uuid" \
  -H "Accept-Language: en" \
  -d '{
    "dilemmaName": "medical",
    "choice": "A",
    "reasoning": "I think we should prioritize the family"
  }'

# Ответ должен быть массив строк НА АНГЛИЙСКОМ
```

### 3. Проверка Frontend

```bash
# 1. Запустить frontend
cd /Users/apple/work/dilemma/frontend-dilemma
npm run dev

# 2. Открыть браузер: http://localhost:5173
# 3. Проверить DilemmaSelectionPage - должны отобразиться дилеммы
# 4. Выбрать дилемму medical → пройти flow → InsightPage
# 5. На InsightPage должны появиться контр-аргументы от AI на иврите
# 6. Переключить язык на English → повторить flow
# 7. Контр-аргументы должны быть на английском
```

---

## 🔍 Проверка состояния БД

```sql
-- Проверить имена дилемм
SELECT id, name, title FROM dilemmas;

-- Ожидаемый результат:
-- id | name         | title
-- ---+--------------+--------------------
-- 1  | medical      | אתיקה רפואית
-- 2  | professional | אתיקה מקצועית
-- 3  | state        | מדינה וחברה יהודית

-- Проверить связанные решения (если есть данные)
SELECT d.name as dilemma_name, COUNT(dec.id) as decisions_count
FROM dilemmas d
LEFT JOIN decisions dec ON d.id = dec.dilemma_id
GROUP BY d.name;
```

---

## ❌ Откат изменений (если нужно)

Если что-то пошло не так:

```bash
# 1. Остановить backend
# 2. Откатить git изменения
cd /Users/apple/work/dilemma
git checkout HEAD -- backend-dilemma/src/i18n/
git checkout HEAD -- backend-dilemma/src/modules/dilemmas/dilemmas.service.ts
git checkout HEAD -- backend-dilemma/src/modules/feedback/

# 3. Откатить миграцию БД (если применили Вариант 2)
# Выполнить обратную миграцию:
UPDATE dilemmas SET name = 'trolley-problem' WHERE name = 'medical';
UPDATE dilemmas SET name = 'privacy-vs-security' WHERE name = 'professional';
UPDATE dilemmas SET name = 'ai-autonomy' WHERE name = 'state';

# 4. Перезапустить backend
```

---

## 📊 Проверка успешности развёртывания

Чеклист:

- [ ] Backend запускается без ошибок
- [ ] GET `/api/dilemmas` возвращает дилеммы с именами: medical, professional, state
- [ ] Frontend отображает список дилемм на DilemmaSelectionPage
- [ ] Можно выбрать дилемму и пройти весь flow до InsightPage
- [ ] На InsightPage появляются AI контр-аргументы
- [ ] AI контр-аргументы на иврите (если язык = he)
- [ ] AI контр-аргументы на английском (если язык = en)
- [ ] Переключение языка работает корректно
- [ ] Нет ошибок в консоли браузера
- [ ] Нет ошибок в логах backend

---

## 🐛 Решение проблем

### Проблема: "Dilemma not found"

**Причина:** БД содержит старые имена дилемм

**Решение:** Применить миграцию или пересоздать БД (см. Вариант 1 или 2)

---

### Проблема: AI отвечает не на том языке

**Причина:** OpenAI Assistant игнорирует инструкции в промпте

**Решение:**
1. Проверить настройки Assistant в OpenAI Dashboard
2. Добавить системную инструкцию в Assistant:
   ```
   You must respond in the language specified in the user message.
   If the message contains "אנא ענה בעברית", respond in Hebrew.
   If the message contains "Please respond in English", respond in English.
   ```

---

### Проблема: Frontend показывает "missing translation keys"

**Причина:** Frontend использует локальные ключи локализации вместо данных от API

**Решение:** Это известная проблема. Frontend всё ещё использует `useDilemmaData` с локальными ключами.
Полное решение требует реализации US2 из `LOCALIZATION_TASKS.md`.

**Временное решение:** Frontend локализация уже содержит правильные ключи (`dilemmas.medical`, `dilemmas.professional`, `dilemmas.state`), поэтому всё должно работать.

---

## 📝 Следующие шаги

После успешного развёртывания:

1. ✅ Протестировать на staging/development
2. ✅ Убедиться, что AI отвечает на правильном языке
3. ✅ Собрать feedback от пользователей
4. ⏭️ Реализовать US2 из LOCALIZATION_TASKS.md (использовать Backend как источник истины)
5. ⏭️ Добавить sources (источники) на Backend
6. ⏭️ E2E тестирование

---

## 🔗 Связанные документы

- `LOCALIZATION_ANALYSIS.md` - Детальный анализ проблем
- `LOCALIZATION_TASKS.md` - Полный план задач (51 задача, 7 фаз)
- `migration-rename-dilemmas.sql` - SQL миграция

---

**Дата создания:** 2026-01-24  
**Автор:** AI Assistant  
**Статус:** ✅ Ready for deployment
