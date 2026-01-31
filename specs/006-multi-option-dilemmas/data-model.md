# Data Model: Multi-Option Dilemmas (006)

**Feature**: [spec.md](./spec.md)

## Entity Relationship Diagram

```
User (1) ────────< (N) UserDecision (N) >─────── (1) Dilemma (1) ────────< (N) DilemmaOption
```

Dilemma имеет массив опций (DilemmaOption); тексты вариантов — через i18n.

## Changes from Current Model

- **Dilemma**: поле `options_count` (2..10). Варианты ответа вынесены в отдельную таблицу `dilemma_options` (массив опций A, B, C, …). Тексты title/description/feedback отдаются через i18n по ключам `dilemmas.{name}.option_{letter}_*`, `feedback_{letter}`.
- **DilemmaOption** (новая сущность): связь дилема → опции (dilemma_id, option_letter). Один ряд = одна буква (A, B, C, …).
- **UserDecision**: `initial_choice` и `final_choice` допускают значения A..J (varchar(1)); валидация по `dilemma.options_count` в сервисе.
- **Path**: конкатенация `initial_choice + final_choice`; для N вариантов — N² возможных траекторий.

## Entities (updated)

### Dilemma

**Table**: `dilemmas`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY, NOT NULL | Auto-increment ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Unique name |
| title | VARCHAR(255) | NOT NULL | Dilemma title |
| description | TEXT | NOT NULL | Full description |
| **options_count** | **SMALLINT** | **NOT NULL, DEFAULT 2, CHECK (options_count >= 2 AND options_count <= 10)** | **Number of options (2–10)** |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Update timestamp |

Опции хранятся в таблице `dilemma_options`. Тексты вариантов и фидбэка отдаются через i18n.

**Validation**: При обновлении дилемы, если по ней есть хотя бы одна запись в `user_decisions`, менять `options_count` и набор вариантов нельзя (FR-010).

---

### DilemmaOption

**Table**: `dilemma_options`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY, NOT NULL | Auto-increment ID |
| dilemma_id | INTEGER | FOREIGN KEY → dilemmas(id), NOT NULL | Дилема |
| option_letter | VARCHAR(1) | NOT NULL, UNIQUE(dilemma_id, option_letter) | Буква варианта: A, B, C, … J |

---

### UserDecision

**Table**: `user_decisions`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY, NOT NULL | Auto-increment ID |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to User |
| dilemma_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to Dilemma |
| initial_choice | VARCHAR(1) | NOT NULL, CHECK (initial_choice IN ('A','B',...,'J')) | Initial choice (A–J) |
| final_choice | VARCHAR(1) | NULL, CHECK (final_choice IN ('A','B',...,'J')) | Final choice (A–J) |
| changed_mind | BOOLEAN | NULL | initial_choice !== final_choice |
| initial_at | TIMESTAMP | NOT NULL | Initial choice timestamp |
| final_at | TIMESTAMP | NULL | Final choice timestamp |
| time_to_decide | INTEGER | NULL | Seconds between initial and final |

**Business rule**: `initial_choice` и `final_choice` должны входить в допустимый набор вариантов данной дилемы (по `dilemma.options_count`: A=1, B=2, …, letter = 64+index). Проверка в сервисе при создании/обновлении.

**Path**: `path = initial_choice + final_choice` (например, AA, AC, CB); хранится вычисляемым при необходимости или в агрегатах статистики.

---

## Statistics (path counts)

Агрегат по дилеме: для каждой завершённой записи (final_choice IS NOT NULL) вычисляется траектория `initial_choice + final_choice`. Результат — объект `pathCounts`: ключ — траектория (AA, AB, …, JJ), значение — количество. Плюс `totalCompleted`. Для 2-вариантных дилем — только AA, AB, BA, BB; для 3-вариантных — 9 ключей и т.д.

---

## Migration Summary

1. **dilemmas**: добавить колонку `options_count SMALLINT NOT NULL DEFAULT 2` с CHECK (2..10). Опции вынести в таблицу `dilemma_options` (см. `migration-options-to-table.sql`): создать таблицу, перенести данные из колонок option_a/b/c, удалить колонки option_* и feedback_* из `dilemmas`.
2. **user_decisions**: валидация `initial_choice` и `final_choice` (A..J) в приложении.
3. i18n: ключи `option_{letter}_title`, `option_{letter}_description`, `feedback_{letter}` для вариантов A–J по мере необходимости.
