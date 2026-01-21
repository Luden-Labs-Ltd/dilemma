# Feature Specification: Docker контейнеризация для backend-dilemma

**Feature Branch**: `001-docker`  
**Created**: 2025-01-19  
**Status**: Draft  
**Input**: User description: "создай докер файл и докер компоуз по аналогии с этим проектом к примеру  /Users/philip_moriss/frilance/spend-poland/backend"

## User Scenarios & Testing

### User Story 1 - Разработка с Docker (Priority: P1)

Разработчик может запустить весь стек приложения (backend + база данных) одной командой через docker-compose для локальной разработки.

**Why this priority**: Это базовая функциональность для упрощения процесса разработки. Без Docker разработчикам нужно вручную настраивать окружение, что замедляет onboarding и может привести к проблемам с совместимостью.

**Independent Test**: Можно протестировать через запуск `docker-compose -f docker-compose.dev.yml up`. Все сервисы должны запуститься, приложение должно быть доступно на указанном порту, база данных должна быть готова к подключению.

**Acceptance Scenarios**:

1. **Given** разработчик имеет установленный Docker и Docker Compose, **When** разработчик запускает `docker-compose -f docker-compose.dev.yml up`, **Then** все сервисы (backend, database) запускаются успешно
2. **Given** сервисы запущены, **When** разработчик обращается к API на порту 3000, **Then** приложение отвечает корректно
3. **Given** сервисы запущены, **When** разработчик подключается к базе данных на порту 5432, **Then** подключение успешно
4. **Given** разработчик изменяет код в src/, **When** файлы сохраняются, **Then** приложение автоматически перезагружается (hot reload)

---

### User Story 2 - Production сборка (Priority: P2)

Разработчик может собрать production образ приложения для деплоя.

**Why this priority**: Это важно для деплоя приложения в production окружение, но не критично для локальной разработки.

**Independent Test**: Можно протестировать через сборку `docker build -t backend-dilemma .` и запуск контейнера. Образ должен быть минимального размера, приложение должно запускаться и работать корректно.

**Acceptance Scenarios**:

1. **Given** разработчик имеет Dockerfile, **When** разработчик собирает образ командой `docker build -t backend-dilemma .`, **Then** образ успешно собирается
2. **Given** образ собран, **When** разработчик запускает контейнер, **Then** приложение запускается в production режиме
3. **Given** образ собран, **When** разработчик проверяет размер образа, **Then** образ оптимизирован (использует multi-stage build, не содержит dev зависимостей)

---

### Edge Cases

- Что происходит если порт 3000 или 5432 уже занят другим приложением?
- Как система обрабатывает ситуацию когда база данных еще не готова при запуске приложения?
- Что происходит при потере соединения с базой данных во время работы?
- Как обрабатываются переменные окружения при отсутствии .env файла?
- Что происходит при изменении зависимостей в package.json?

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide Dockerfile for production build
- **FR-002**: System MUST provide Dockerfile.dev for development environment
- **FR-003**: System MUST provide docker-compose.dev.yml for local development
- **FR-004**: Dockerfile MUST use multi-stage build for optimization
- **FR-005**: Development Docker setup MUST support hot reload (volume mounting)
- **FR-006**: Docker setup MUST include PostgreSQL database service
- **FR-007**: Database service MUST have health check
- **FR-008**: Application MUST wait for database to be ready before starting
- **FR-009**: Docker setup MUST support environment variables via .env file
- **FR-010**: Production Dockerfile MUST exclude dev dependencies
- **FR-011**: Docker setup MUST expose application on port 3000
- **FR-012**: Docker setup MUST expose database on port 5432

### Key Entities

- **Dockerfile**: Production образ приложения с оптимизированной сборкой
- **Dockerfile.dev**: Development образ с поддержкой hot reload
- **docker-compose.dev.yml**: Конфигурация для локальной разработки с сервисами backend и database

## Success Criteria

### Measurable Outcomes

- **SC-001**: Разработчик может запустить весь стек одной командой за менее чем 2 минуты
- **SC-002**: Production образ собирается за менее чем 5 минут
- **SC-003**: Production образ имеет размер менее 500MB
- **SC-004**: Hot reload работает с задержкой менее 2 секунд после изменения файла
- **SC-005**: База данных готова к подключению в течение 30 секунд после запуска
- **SC-006**: Все сервисы запускаются без ошибок в 100% случаев при корректной конфигурации

## Assumptions

- Разработчики имеют установленный Docker и Docker Compose
- Используется PostgreSQL как база данных
- Приложение использует npm или yarn для управления зависимостями
- Порт 3000 доступен для приложения
- Порт 5432 доступен для базы данных
- Переменные окружения настраиваются через .env файлы
