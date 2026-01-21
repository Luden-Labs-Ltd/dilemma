# Data Model: Система дилем

## Entity Relationship Diagram

```
User (1) ────────< (N) UserDecision (N) >─────── (1) Dilemma
```

## Entities

### User

**Table**: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL, DEFAULT gen_random_uuid() | Unique identifier |
| client_uuid | UUID | UNIQUE, NOT NULL | UUID from frontend |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| last_active | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last activity timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `client_uuid`
- INDEX on `last_active`

**Relationships**:
- One-to-Many with UserDecision

### Dilemma

**Table**: `dilemmas`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY, NOT NULL | Auto-increment ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Unique name (dilemma1, dilemma2, etc.) |
| title | VARCHAR(255) | NOT NULL | Dilemma title |
| description | TEXT | NOT NULL | Full description |
| option_a_title | VARCHAR(255) | NOT NULL | Option A title |
| option_a_description | TEXT | NOT NULL | Option A description |
| option_b_title | VARCHAR(255) | NOT NULL | Option B title |
| option_b_description | TEXT | NOT NULL | Option B description |
| feedback_a | TEXT | NOT NULL | Feedback after choosing A |
| feedback_b | TEXT | NOT NULL | Feedback after choosing B |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `name`
- INDEX on `is_active`

**Relationships**:
- One-to-Many with UserDecision

### UserDecision

**Table**: `user_decisions`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY, NOT NULL | Auto-increment ID |
| user_id | UUID | FOREIGN KEY, NOT NULL | Reference to User |
| dilemma_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to Dilemma |
| initial_choice | VARCHAR(1) | NOT NULL, CHECK (initial_choice IN ('A', 'B')) | Initial choice |
| final_choice | VARCHAR(1) | NULL, CHECK (final_choice IN ('A', 'B')) | Final choice (nullable) |
| changed_mind | BOOLEAN | NULL | Whether mind was changed |
| initial_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Initial choice timestamp |
| final_at | TIMESTAMP | NULL | Final choice timestamp |
| time_to_decide | INTEGER | NULL | Time in seconds between initial and final |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `(user_id, dilemma_id)` - one participation per user per dilemma
- INDEX on `dilemma_id` (for statistics)
- INDEX on `final_choice` (for filtering completed)
- FOREIGN KEY on `user_id` REFERENCES `users(id)`
- FOREIGN KEY on `dilemma_id` REFERENCES `dilemmas(id)`

**Relationships**:
- Many-to-One with User
- Many-to-One with Dilemma

**Business Rules**:
- `changed_mind` = `(initial_choice != final_choice)` when final_choice is set
- `time_to_decide` = `EXTRACT(EPOCH FROM (final_at - initial_at))` when final_choice is set
- One user can have only one UserDecision per Dilemma (enforced by unique constraint)

## Enums

### ChoiceEnum
```typescript
enum Choice {
  A = 'A',
  B = 'B'
}
```

## Sample Data

### Dilemma Example
```json
{
  "name": "dilemma1",
  "title": "Этическая дилема: Тележка",
  "description": "Вагонетка несется по рельсам. На пути 5 рабочих. Вы стоите у стрелки и можете перевести ее на другой путь, где работает 1 человек.",
  "option_a_title": "Переключить стрелку",
  "option_a_description": "Убить 1, спасти 5",
  "option_b_title": "Не вмешиваться",
  "option_b_description": "Убить 5, спасти 1",
  "feedback_a": "Вы стали активным участником и взяли ответственность. Философы называют это 'доктриной двойного эффекта'.",
  "feedback_b": "Вы решили не вмешиваться в естественный ход событий. В этике это позиция 'непричинения вреда действием'.",
  "is_active": true
}
```

## Migration Strategy

### Initial Migration
1. Create `users` table
2. Create `dilemmas` table
3. Create `user_decisions` table
4. Create all indexes and constraints
5. Create enum type for choices (if using PostgreSQL enum)

### Seed Migration
1. Insert 3 initial dilemmas (dilemma1, dilemma2, dilemma3)
