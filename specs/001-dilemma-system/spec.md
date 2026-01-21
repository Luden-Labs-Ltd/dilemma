# Feature Specification: Система дилем с фиксацией изменений решений

**Feature Branch**: `001-dilemma-system`  
**Created**: 2025-01-15  
**Status**: Draft  
**Input**: User description: "Система дилем с фиксацией изменений решений. Пользователи делают первоначальный выбор между вариантами А и Б, получают фидбэк о последствиях, и могут изменить решение."

## User Scenarios & Testing

### User Story 1 - Просмотр и выбор дилемы (Priority: P1)

Пользователь заходит в систему, получает UUID (новый или существующий), видит список доступных активных дилем, выбирает одну дилему и видит ее полное описание с двумя вариантами выбора.

**Why this priority**: Это первый шаг в user journey. Без возможности просмотра и выбора дилемы система не может функционировать. Это базовая функциональность для MVP.

**Independent Test**: Можно полностью протестировать через GET /api/dilemmas и GET /api/dilemmas/{name}. Система должна возвращать список активных дилем и детали конкретной дилемы. Это независимо от других функций и доставляет ценность - пользователь может увидеть доступные дилемы.

**Acceptance Scenarios**:

1. **Given** система содержит активные дилемы, **When** пользователь запрашивает GET /api/dilemmas, **Then** система возвращает список активных дилем с названием, описанием и количеством участников
2. **Given** существует дилема с именем "dilemma1", **When** пользователь запрашивает GET /api/dilemmas/dilemma1, **Then** система возвращает полную информацию о дилеме включая оба варианта (А и Б) с их описаниями
3. **Given** пользователь уже участвовал в дилеме, **When** пользователь запрашивает GET /api/dilemmas/{name} с заголовком X-User-UUID, **Then** система указывает что пользователь уже участвовал

---

### User Story 2 - Первоначальный выбор и получение фидбэка (Priority: P1)

Пользователь делает первоначальный выбор между вариантами А и Б, система сохраняет выбор и возвращает фидбэк-текст с обоснованием последствий выбора.

**Why this priority**: Это ключевая функциональность системы - возможность сделать выбор и получить обратную связь. Без этого система теряет свой основной смысл.

**Independent Test**: Можно протестировать через POST /api/decisions/initial. Система должна создать запись UserDecision с initial_choice и вернуть соответствующий фидбэк (feedback_a или feedback_b). Это независимо от финального решения и доставляет ценность - пользователь получает информацию о последствиях выбора.

**Acceptance Scenarios**:

1. **Given** пользователь с UUID и существующая дилема "dilemma1", **When** пользователь отправляет POST /api/decisions/initial с choice="A", **Then** система создает UserDecision с initial_choice="A" и возвращает feedback_a
2. **Given** пользователь уже сделал initial choice для дилемы, **When** пользователь пытается сделать initial choice повторно, **Then** система возвращает ошибку что выбор уже сделан
3. **Given** несуществующая дилема, **When** пользователь отправляет POST /api/decisions/initial, **Then** система возвращает ошибку 404

---

### User Story 3 - Финальное решение с возможностью изменения мнения (Priority: P1)

После получения фидбэка пользователь может подтвердить первоначальный выбор или изменить его на противоположный вариант. Система сохраняет финальное решение и вычисляет изменил ли пользователь мнение.

**Why this priority**: Это завершающий шаг основного флоу. Без возможности зафиксировать финальное решение система не может отслеживать траектории пользователей.

**Independent Test**: Можно протестировать через POST /api/decisions/final. Система должна обновить UserDecision с final_choice, вычислить changed_mind и time_to_decide. Это независимо от статистики и доставляет ценность - пользователь завершает процесс принятия решения.

**Acceptance Scenarios**:

1. **Given** пользователь сделал initial choice="A" для дилемы, **When** пользователь отправляет POST /api/decisions/final с choice="B", **Then** система обновляет UserDecision с final_choice="B", changed_mind=true и вычисляет time_to_decide
2. **Given** пользователь сделал initial choice="A", **When** пользователь отправляет POST /api/decisions/final с choice="A", **Then** система обновляет UserDecision с final_choice="A", changed_mind=false
3. **Given** пользователь не сделал initial choice, **When** пользователь пытается сделать final choice, **Then** система возвращает ошибку что нужно сначала сделать initial choice
4. **Given** пользователь уже сделал final choice, **When** пользователь пытается изменить решение, **Then** система возвращает ошибку что решение уже зафиксировано

---

### User Story 4 - Просмотр личной статистики (Priority: P2)

Пользователь может просмотреть все дилемы где он участвовал, увидеть свои выборы и траектории (AA, AB, BB, BA).

**Why this priority**: Это важная функция для пользовательского опыта - возможность увидеть свою историю участия. Однако это не критично для MVP.

**Independent Test**: Можно протестировать через GET /api/decisions/my с заголовком X-User-UUID. Система должна вернуть список всех решений пользователя с initial_choice, final_choice, changed_mind и path. Это независимо от общей статистики.

**Acceptance Scenarios**:

1. **Given** пользователь участвовал в нескольких дилемах, **When** пользователь запрашивает GET /api/decisions/my, **Then** система возвращает список всех его решений с деталями
2. **Given** пользователь не участвовал ни в одной дилеме, **When** пользователь запрашивает GET /api/decisions/my, **Then** система возвращает пустой список

---

### User Story 5 - Просмотр общей статистики по дилеме (Priority: P2)

Пользователь может просмотреть общую статистику по дилеме: количество участников, распределение по 4 траекториям (AA, AB, BB, BA), процент изменивших мнение, среднее время обдумывания.

**Why this priority**: Это ценная аналитика для понимания поведения пользователей, но не критично для основного флоу. Можно реализовать после MVP.

**Independent Test**: Можно протестировать через GET /api/statistics/dilemma/{name}. Система должна вернуть агрегированную статистику по завершенным участиям. Это независимо от личной статистики.

**Acceptance Scenarios**:

1. **Given** дилема имеет завершенные участия, **When** пользователь запрашивает GET /api/statistics/dilemma/{name}, **Then** система возвращает статистику с распределением по 4 траекториям, процентами и средним временем
2. **Given** дилема имеет менее 10 участников, **When** пользователь запрашивает статистику, **Then** система может не показывать точные проценты (опционально)
3. **Given** несуществующая дилема, **When** пользователь запрашивает статистику, **Then** система возвращает ошибку 404

---

### User Story 6 - Просмотр списка пользователей (Priority: P3)

Администратор или система может просмотреть список всех пользователей в системе с их базовой информацией.

**Why this priority**: Это административная функция для мониторинга и управления пользователями. Не критично для основного пользовательского флоу.

**Independent Test**: Можно протестировать через GET /api/users. Система должна вернуть список всех пользователей с их UUID, датой создания и последней активности.

**Acceptance Scenarios**:

1. **Given** в системе есть пользователи, **When** запрашивается GET /api/users, **Then** система возвращает список всех пользователей с их данными
2. **Given** в системе нет пользователей, **When** запрашивается GET /api/users, **Then** система возвращает пустой список

---

### Edge Cases

- Что происходит когда пользователь пытается участвовать в одной дилеме дважды?
- Как система обрабатывает ситуацию когда дилема становится неактивной после initial choice?
- Что происходит если пользователь пытается сделать final choice до истечения минимального времени обдумывания (если такое правило есть)?
- Как система обрабатывает ситуацию когда прошло более N часов после initial choice (если есть ограничение по времени)?
- Что происходит при одновременных запросах от одного пользователя?
- Как система обрабатывает невалидные UUID в заголовке X-User-UUID?

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow users to view list of active dilemmas
- **FR-002**: System MUST allow users to view details of a specific dilemma by name
- **FR-003**: System MUST allow users to make initial choice (A or B) for a dilemma
- **FR-004**: System MUST return feedback text corresponding to the initial choice
- **FR-005**: System MUST allow users to make final choice (A or B) after initial choice
- **FR-006**: System MUST prevent users from making final choice without initial choice
- **FR-007**: System MUST prevent users from participating in the same dilemma twice
- **FR-008**: System MUST prevent users from changing final choice after it's been made
- **FR-009**: System MUST calculate changed_mind based on comparison of initial_choice and final_choice
- **FR-010**: System MUST calculate time_to_decide as difference between final_at and initial_at in seconds
- **FR-011**: System MUST allow users to view their personal decision history
- **FR-012**: System MUST provide aggregated statistics for dilemmas (4 paths: AA, AB, BB, BA)
- **FR-013**: System MUST identify users by client_uuid from X-User-UUID header
- **FR-014**: System MUST only include completed participations (with final_choice) in statistics
- **FR-015**: System MUST validate that choice is either 'A' or 'B'
- **FR-016**: System MUST allow viewing list of all users with their basic information

### Key Entities

- **User**: Represents a user identified by client_uuid. Has id (UUID), client_uuid (UUID), created_at, last_active
- **Dilemma**: Represents an ethical dilemma with two options. Has id, name (unique), title, description, option_a_title, option_a_description, option_b_title, option_b_description, feedback_a, feedback_b, is_active
- **UserDecision**: Represents a user's decision process for a dilemma. Has id, user_id (FK to User), dilemma_id (FK to Dilemma), initial_choice (A or B), final_choice (A, B, or NULL), changed_mind (boolean), initial_at, final_at, time_to_decide (seconds). Relationship: One User can have many UserDecisions, one Dilemma can have many UserDecisions. Constraint: One User can have only one UserDecision per Dilemma.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can view list of dilemmas and select one in under 2 seconds
- **SC-002**: Users can complete full decision flow (initial choice → feedback → final choice) in under 5 minutes
- **SC-003**: System handles 1000 concurrent users making decisions without degradation
- **SC-004**: 95% of API requests return responses in under 500ms
- **SC-005**: System correctly calculates statistics for dilemmas with 1000+ participants
- **SC-006**: Zero data loss for user decisions (100% persistence rate)
- **SC-007**: System prevents duplicate participations with 100% accuracy

## Assumptions

- Users are identified by UUID generated on frontend (no authentication required)
- One user can participate in multiple different dilemmas
- One user can participate in each dilemma only once
- Statistics are calculated from completed participations only (with final_choice)
- System will have at least 3 dilemmas initially
- Feedback text is static (no A/B testing in initial version)
