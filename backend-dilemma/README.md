# Backend Dilemma - Система дилем с фиксацией изменений решений

Backend API для системы этических дилем с возможностью изменения решения после получения фидбэка.

## Технологии

- **NestJS** 11.x
- **TypeScript** 5.7+ (strict mode)
- **TypeORM** для работы с БД
- **PostgreSQL** база данных
- **Swagger** для документации API

## Установка

```bash
# Установить зависимости
pnpm install

# Настроить переменные окружения (создать .env файл)
cp .env.example .env
# Отредактировать .env с вашими настройками БД
```

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=dilemma_db

# Application
PORT=3000
NODE_ENV=development

# OpenAI (for AI Feedback module)
OPENAI_API_KEY=sk-...
OPENAI_ASSISTANT_ID=ass_...
```

## Запуск

### Без Docker (pnpm)

```bash
# Development mode (backend)
pnpm run start:dev

# Production mode (backend)
pnpm run build
pnpm run start:prod
```

### Фронтенд (pnpm, Vite React, папка `frontend-dilemma`)

```bash
# Установка зависимостей (один раз)
cd ../frontend-dilemma
pnpm install

# Development mode (frontend)
pnpm dev

# Линтеры и типы
pnpm lint
pnpm ts-check
```

### С Docker (рекомендуется, pnpm внутри контейнера)

См. подробную инструкцию в [DOCKER.md](./DOCKER.md)

```bash
# Development окружение
pnpm run docker:dev

# Остановка
pnpm run docker:dev:down
```

## API Документация

После запуска приложения, Swagger документация доступна по адресу:
```
http://localhost:3000/api/docs
```

## API Endpoints

### Dilemmas
- `GET /api/dilemmas` - Список активных дилем
- `GET /api/dilemmas/:name` - Детали дилемы

### Decisions
- `POST /api/decisions/initial` - Создать первоначальный выбор
- `POST /api/decisions/final` - Зафиксировать финальное решение

### Statistics
- `GET /api/statistics/dilemma/:name` - Статистика по дилеме

## Тестирование

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Структура проекта

```
src/
├── modules/
│   ├── users/          # Модуль пользователей
│   ├── dilemmas/       # Модуль дилем
│   ├── decisions/      # Модуль решений
│   └── statistics/     # Модуль статистики
├── common/             # Общие утилиты, декораторы, guards
├── config/             # Конфигурация
└── main.ts             # Точка входа
```

## База данных

Проект использует PostgreSQL. TypeORM автоматически создаст таблицы при запуске в development режиме (synchronize: true).

Для production используйте миграции:
```bash
pnpm run migration:generate -- -n MigrationName
pnpm run migration:run
```

## Спецификация

Полная спецификация проекта находится в `/specs/001-dilemma-system/`:
- `spec.md` - Спецификация фичи
- `plan.md` - Технический план реализации
- `tasks.md` - Детальные задачи
- `data-model.md` - Модель данных
- `quickstart.md` - Быстрый старт API
