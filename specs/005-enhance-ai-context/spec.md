# Feature Specification: Расширение контекста для AI-фидбэка

**Feature Branch**: `005-enhance-ai-context`  
**Created**: 2026-01-26  
**Status**: Draft  
**Input**: User description: "сделай отправку в аи еще языка, а так же текст после переводов чтобы у аи больше контекста было"

## Clarifications

### Session 2026-01-26

- Q: Как клиент должен передавать переводы дилеммы в запросе? → A: Клиент передает переводы в теле запроса POST /feedback/analyze как новые поля (title, subtitle, questionText, description, reflectionText, options)
- Q: Как структурировать поля переводов в запросе? → A: Отдельный объект dilemmaText с вложенной структурой: { title, subtitle, questionText, description, reflectionText, options: { a, b } }
- Q: Откуда брать оригинальный английский текст для AI-промпта? → A: Клиент передает и переводы на текущем языке, и оригинальный английский текст в запросе
- Q: Как структурировать передачу двух языков в запросе? → A: Два объекта: dilemmaText (текущий язык) и dilemmaTextOriginal (английский оригинал)
- Q: Какие поля обязательны для валидации? → A: dilemmaText обязателен, dilemmaTextOriginal опционален (fallback на существующую логику backend, если не передан)

## User Scenarios & Testing

### User Story 1 - Отправка дополнительного языка в AI-промпт (Priority: P1)

Когда клиент отправляет запрос на AI-фидбэк с переводом дилеммы на текущем языке пользователя (например, иврит), система отправляет в промпт не только текст на языке пользователя из dilemmaText, но и оригинальный английский текст из dilemmaTextOriginal для предоставления AI большего контекста. Это позволяет AI лучше понимать нюансы дилеммы и генерировать более качественные контраргументы.

**Why this priority**: Это основная функциональность фичи. Без дополнительного языка AI имеет ограниченный контекст и может генерировать менее точные ответы. Дополнительный язык значительно улучшает качество анализа.

**Independent Test**: Можно протестировать через отправку запроса на AI-фидбэк с dilemmaText и dilemmaTextOriginal и проверку промпта, отправляемого в OpenAI. Промпт должен содержать текст дилеммы на языке пользователя (из dilemmaText) и на английском языке (из dilemmaTextOriginal). Это независимо от других функций и доставляет ценность - AI получает больше контекста для анализа.

**Acceptance Scenarios**:

1. **Given** клиент отправляет запрос с dilemmaText на иврите и dilemmaTextOriginal на английском, **When** система строит промпт для AI, **Then** промпт содержит текст дилеммы на иврите (из dilemmaText) и на английском языке (из dilemmaTextOriginal)
2. **Given** клиент отправляет запрос с dilemmaText на русском и dilemmaTextOriginal на английском, **When** система строит промпт для AI, **Then** промпт содержит текст дилеммы на русском (из dilemmaText) и на английском языке (из dilemmaTextOriginal)
3. **Given** клиент отправляет запрос с dilemmaText на английском и dilemmaTextOriginal на английском, **When** система строит промпт для AI, **Then** промпт содержит текст дилеммы на английском из обоих источников, четко разделенных метками
4. **Given** система строит промпт с дополнительным языком, **When** промпт отправляется в AI, **Then** структура промпта четко разделяет основной язык пользователя (из dilemmaText) и оригинальный английский текст (из dilemmaTextOriginal) для контекста

---

### User Story 2 - Отправка оригинального текста в AI-промпт (Priority: P1)

Клиент передает в запросе оригинальный английский текст из translation.json вместе с переводами на текущем языке. Система отправляет в AI-промпт оба варианта текста, что предоставляет AI полный контекст оригинального текста и улучшает понимание смысла и нюансов дилеммы.

**Why this priority**: Оригинальный текст содержит полный контекст и нюансы, которые могут быть потеряны при переводе. Это критически важно для качественного анализа AI.

**Independent Test**: Можно протестировать через проверку промпта, отправляемого в OpenAI. Промпт должен содержать оригинальный английский текст из dilemmaTextOriginal для всех полей дилеммы (title, subtitle, questionText, description, reflectionText, options). Это независимо от других функций и доставляет ценность - AI получает полный оригинальный контекст.

**Acceptance Scenarios**:

1. **Given** клиент отправляет запрос с dilemmaText (текущий язык) и dilemmaTextOriginal (английский), **When** система строит промпт для AI, **Then** промпт содержит оригинальный английский текст из dilemmaTextOriginal для всех полей дилеммы (title, subtitle, questionText, description, reflectionText, options)
2. **Given** оригинальный текст из dilemmaTextOriginal доступен в запросе, **When** система строит промпт, **Then** оригинальный текст четко помечен как "Original English text" или аналогичной меткой для различения от переводов
3. **Given** клиент не передал dilemmaTextOriginal (опциональное поле), **When** система строит промпт, **Then** система обрабатывает отсутствие оригинального текста gracefully (использует fallback на существующую логику backend или пропускает)
4. **Given** система отправляет промпт с оригинальным текстом, **When** AI анализирует дилемму, **Then** AI использует оригинальный текст для лучшего понимания контекста и генерации более точных контраргументов

---

### Edge Cases

- Что происходит когда клиент не передал dilemmaTextOriginal? (Ответ: система использует fallback на существующую логику backend для получения переводов)
- Как система обрабатывает ситуацию когда дополнительный язык недоступен? (Ответ: система использует английский как fallback для дополнительного языка)
- Что происходит если пользователь запрашивает фидбэк на языке, который не поддерживается? (Ответ: система использует английский как основной язык)
- Что происходит если клиент передал dilemmaText, но не передал dilemmaTextOriginal? (Ответ: система обрабатывает запрос с dilemmaText и использует fallback для оригинального текста)
- Что происходит если структура dilemmaText или dilemmaTextOriginal неполная (отсутствуют некоторые поля)? (Ответ: система обрабатывает отсутствующие поля gracefully, отправляя только доступные поля в промпт)
- Что происходит если клиент передал некорректную структуру данных (например, options не объект)? (Ответ: система возвращает ошибку валидации 400)

## Requirements

### Functional Requirements

- **FR-001**: System MUST include original English text from dilemmaTextOriginal in AI prompt when provided by client, in addition to user's language text from dilemmaText
- **FR-002**: System MUST include original English text from dilemmaTextOriginal in AI prompt for all dilemma fields (title, subtitle, questionText, description, reflectionText, options) when provided by client
- **FR-003**: System MUST clearly label original English text in prompt to distinguish it from translated text
- **FR-004**: System MUST include both user's language (from dilemmaText) and original English text (from dilemmaTextOriginal) in prompt structure
- **FR-005**: System MUST handle cases where dilemmaTextOriginal is not provided by client gracefully (use fallback on existing backend logic or skip)
- **FR-006**: System MUST validate that dilemmaText is provided and contains required fields (title, description, options)
- **FR-007**: System MUST maintain existing prompt structure while adding additional language and original text sections
- **FR-008**: System MUST ensure prompt length does not exceed AI model limits when adding additional content
- **FR-009**: System MUST accept translated dilemma text from client in request body as two objects: `dilemmaText: { title, subtitle, questionText, description, reflectionText, options: { a, b } }` (user's current language, required) and `dilemmaTextOriginal: { title, subtitle, questionText, description, reflectionText, options: { a, b } }` (English original, optional)
- **FR-010**: System MUST include original text for all relevant dilemma fields when dilemmaTextOriginal is provided: title, subtitle, questionText, description, reflectionText, options (a and b)

### Key Entities

- **Enhanced AI Prompt**: Represents AI prompt that includes user's language (from dilemmaText), additional language (English), and original English text (from dilemmaTextOriginal when provided). Contains structured sections for each language/version to provide maximum context to AI.
- **DilemmaText**: Represents translated dilemma text provided by client in request body for user's current language. Contains fields: title, subtitle, questionText, description, reflectionText, options (a and b). Required field.
- **DilemmaTextOriginal**: Represents original English text provided by client in request body from frontend translation.json files. Contains same structure as DilemmaText. Optional field - if not provided, backend uses fallback logic.

## Success Criteria

### Measurable Outcomes

- **SC-001**: AI prompts include additional language (English) in 100% of requests when user language is not English
- **SC-002**: AI prompts include original English text from dilemmaTextOriginal in 95% of requests when provided by client (allowing for optional field cases)
- **SC-003**: AI feedback quality improves as measured by user satisfaction or feedback relevance (qualitative improvement in counter-arguments quality)
- **SC-004**: System successfully processes enhanced prompts without exceeding AI model token limits in 100% of requests
- **SC-005**: Enhanced prompts are constructed and sent to AI within existing response time constraints (no degradation in performance)

## Assumptions

- Client will provide dilemmaText with user's current language translations in request body
- Client may optionally provide dilemmaTextOriginal with English original text in request body
- If dilemmaTextOriginal is not provided, backend can fallback to existing i18n logic
- Adding additional language and original text to prompts will not exceed AI model token limits
- AI can effectively use multiple language versions and original text to improve analysis quality
- Additional language (English) is always available as fallback when user language is not English
- Original text from dilemmaTextOriginal provides valuable context that improves AI analysis
- Client has access to both translated and original English text from frontend translation.json files
