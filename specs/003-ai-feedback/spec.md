# Feature Specification: Модуль AI-фидбэка для дилем

**Feature Branch**: `003-ai-feedback`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "нужно сделать модуль с контроллером в котором будет отправляться пользователя ответ почему от выбрал диллему и потом аи будет возврощять ему фидбэк вот промт аи ( Реализуй функцию: получая на вход дилемму, ответ пользователя на нее, а также размышления пользователя о выбранном решении, создай массив текстов, каждый из которых объясняет, почему это решение может быть неправильным."

## Clarifications

### Session 2025-01-27

- Q: Как обрабатывать пустые размышления пользователя (null или пустая строка)? → A: Размышления опциональны - обрабатывать запрос без размышлений без предупреждений
- Q: Какие ограничения длины для размышлений пользователя? → A: Лимит 5000 символов - возвращать ошибку валидации 400, если превышен
- Q: Какой таймаут для запросов к AI сервису? → A: Таймаут 60 секунд - возвращать ошибку таймаута, если AI не ответил в течение 60 секунд
- Q: Какие ограничения на размер массива ответов от AI? → A: Без ограничений - принимать массив любого размера от AI
- Q: Как обрабатывать специальные символы в размышлениях пользователя? → A: Принимать любые символы, включая специальные, без санитизации на входе

## User Scenarios & Testing

### User Story 1 - Получение AI-фидбэка на выбор дилемы (Priority: P1)

Пользователь, сделавший выбор в дилеме (A или B) и предоставивший свои размышления о выбранном решении, отправляет запрос на получение AI-фидбэка. Система анализирует дилемму, выбор пользователя и его размышления, затем возвращает массив текстов, каждый из которых объясняет потенциальные недостатки выбранного решения.

**Why this priority**: Это основная функциональность модуля. Без возможности получить AI-фидбэк модуль не имеет смысла. Это ключевая ценность для пользователей - получить альтернативные точки зрения на свое решение.

**Independent Test**: Можно полностью протестировать через POST /api/feedback/analyze. Система должна принять дилемму, выбор пользователя и его размышления, отправить запрос к AI ассистенту, получить массив контраргументов и вернуть их пользователю. Это независимо от других модулей и доставляет ценность - пользователь получает критический анализ своего решения.

**Acceptance Scenarios**:

1. **Given** пользователь сделал выбор A в дилеме "dilemma1" и предоставил размышления "Мне нужны деньги сейчас", **When** пользователь отправляет POST /api/feedback/analyze с данными дилеммы, выбора и размышлений, **Then** система возвращает массив текстов с контраргументами, объясняющими почему выбор A может быть неправильным
2. **Given** пользователь предоставил размышления в неправильном порядке (сначала вывод, потом рассуждения), **When** система обрабатывает запрос, **Then** AI должен перестроить порядок: сначала анализ, потом вывод
3. **Given** пользователь не предоставил размышления (null или пустая строка), **When** пользователь отправляет запрос, **Then** система обрабатывает запрос без размышлений и отправляет промпт к AI только с дилеммой и выбором
4. **Given** несуществующая дилема, **When** пользователь отправляет запрос, **Then** система возвращает ошибку 404
5. **Given** AI сервис недоступен или возвращает ошибку, **When** система пытается получить фидбэк, **Then** система возвращает понятную ошибку пользователю
6. **Given** AI сервис не отвечает в течение 60 секунд, **When** система ожидает ответ, **Then** система возвращает ошибку таймаута пользователю

---

### User Story 2 - Валидация входных данных (Priority: P1)

Система должна валидировать все входные данные перед отправкой запроса к AI: проверять существование дилемы, корректность выбора (A или B), наличие и формат размышлений пользователя.

**Why this priority**: Валидация критична для корректной работы системы и предотвращения ошибок на стороне AI. Без валидации система может отправлять некорректные данные или падать с ошибками.

**Independent Test**: Можно протестировать через отправку различных невалидных данных на POST /api/feedback/analyze. Система должна возвращать соответствующие ошибки валидации до обращения к AI.

**Acceptance Scenarios**:

1. **Given** пользователь отправляет выбор "C" (невалидный), **When** система получает запрос, **Then** система возвращает ошибку валидации 400 до обращения к AI
2. **Given** пользователь отправляет пустые размышления (null или пустая строка), **When** система получает запрос, **Then** система обрабатывает запрос без размышлений и отправляет промпт к AI только с дилеммой и выбором
3. **Given** пользователь отправляет размышления длиннее 5000 символов, **When** система получает запрос, **Then** система возвращает ошибку валидации 400 до обращения к AI
4. **Given** пользователь отправляет несуществующее имя дилемы, **When** система получает запрос, **Then** система возвращает ошибку 404 до обращения к AI

---

### User Story 3 - Обработка ответа AI и форматирование (Priority: P1)

Система должна корректно обработать ответ от AI ассистента, извлечь JSON-массив строк из ответа, валидировать формат и вернуть пользователю структурированный массив контраргументов.

**Why this priority**: Без корректной обработки ответа AI пользователь не получит фидбэк. Это критическая часть функциональности модуля.

**Independent Test**: Можно протестировать через мокирование ответа AI и проверку корректности парсинга и форматирования ответа. Система должна извлекать массив строк из различных форматов ответа AI (с markdown разметкой или без).

**Acceptance Scenarios**:

1. **Given** AI возвращает JSON-массив строк в markdown блоке кода, **When** система обрабатывает ответ, **Then** система извлекает массив и возвращает его пользователю
2. **Given** AI возвращает JSON-массив напрямую без разметки, **When** система обрабатывает ответ, **Then** система парсит массив и возвращает его пользователю
3. **Given** AI возвращает некорректный формат (не массив строк), **When** система обрабатывает ответ, **Then** система возвращает понятную ошибку пользователю
4. **Given** AI возвращает пустой массив, **When** система обрабатывает ответ, **Then** система возвращает пустой массив пользователю

---

### Edge Cases

- Что происходит когда AI сервис недоступен или таймаут? (Ответ: возвращается ошибка таймаута после 60 секунд ожидания)
- Как система обрабатывает ситуацию когда AI возвращает ответ не в формате JSON?
- Что происходит если AI возвращает очень длинный массив (более 100 элементов)? (Ответ: массив принимается без ограничений, возвращается пользователю полностью)
- Как система обрабатывает ситуацию когда размышления пользователя содержат специальные символы или превышают лимит 5000 символов? (Ответ: специальные символы принимаются без санитизации; превышение лимита возвращает ошибку валидации 400)
- Что происходит при одновременных запросах от одного пользователя к одному и тому же AI ассистенту?
- Как система обрабатывает ситуацию когда дилема становится неактивной после отправки запроса?
- Что происходит если пользователь не авторизован (нет валидного UUID в заголовке)?

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow users to request AI feedback on their dilemma choice
- **FR-002**: System MUST accept dilemma identifier (name or ID), user's choice (A or B), and user's reasoning text
- **FR-003**: System MUST validate that dilemma exists before processing request
- **FR-004**: System MUST validate that choice is either 'A' or 'B'
- **FR-005**: System MUST send request to OpenAI Assistant with specified assistant ID
- **FR-006**: System MUST construct prompt including dilemma description, user's choice, and user's reasoning (if provided; reasoning is optional)
- **FR-007**: System MUST handle AI response and extract JSON array of strings
- **FR-008**: System MUST return array of counter-arguments explaining why the choice might be wrong (no size limit on array length)
- **FR-009**: System MUST handle cases where user reasoning is provided in wrong order (conclusion first, then reasoning) and AI should restructure it
- **FR-010**: System MUST handle AI service errors gracefully and return user-friendly error messages
- **FR-011**: System MUST validate AI response format (must be JSON array of strings)
- **FR-012**: System MUST handle timeout scenarios when AI service is slow to respond (timeout set to 60 seconds, return timeout error if exceeded)
- **FR-013**: System MUST identify users by client_uuid from X-User-UUID header (consistent with existing modules)
- **FR-014**: System MUST prevent processing requests for inactive dilemmas
- **FR-015**: System MUST handle empty or null reasoning text by processing request without reasoning (reasoning is optional, no validation error or warning)
- **FR-016**: System MUST validate that reasoning text does not exceed 5000 characters (return validation error 400 if exceeded)
- **FR-017**: System MUST accept reasoning text containing any characters including special characters without input sanitization

### Key Entities

- **FeedbackRequest**: Represents a request for AI feedback. Contains dilemma identifier, user choice (A or B), user reasoning text, user UUID. Does not need to be persisted unless logging is required.
- **FeedbackResponse**: Represents AI feedback response. Contains array of counter-argument strings explaining why the choice might be wrong. Each string is a separate explanation of potential issues with the user's decision.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can receive AI feedback on their dilemma choice within 30 seconds of request
- **SC-002**: System successfully processes 95% of valid feedback requests without errors
- **SC-003**: AI feedback contains at least 3 distinct counter-arguments per request (when applicable)
- **SC-004**: System handles 100 concurrent feedback requests without degradation
- **SC-005**: 90% of AI responses are correctly parsed and returned to users
- **SC-006**: System returns user-friendly error messages for 100% of failed requests
- **SC-007**: Feedback requests are processed with average response time under 20 seconds

## Assumptions

- OpenAI Assistant is configured and accessible with provided assistant ID
- OpenAI API key is available in environment variables
- Users have already made a choice in the dilemma (initial or final choice exists)
- User reasoning text is optional but recommended for better feedback quality
- AI assistant is configured with the provided prompt template
- System will handle rate limiting on OpenAI API side
- Feedback requests do not need to be persisted in database (stateless operation)
- Each feedback request is independent and can be made multiple times for the same choice
- AI feedback is generated in real-time and not cached
