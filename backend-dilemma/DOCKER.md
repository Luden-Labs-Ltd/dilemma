# Docker Setup для Backend Dilemma

## Требования

- Docker 20.10+
- Docker Compose 2.0+

## Быстрый старт

### Development окружение

1. Создайте файл `.env.development` в корне проекта:

```env
DB_HOST=dev-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=dilemma_db
NODE_ENV=development
PORT=3000
```

2. Запустите все сервисы:

```bash
npm run docker:dev
```

или

```bash
docker-compose -f docker-compose.dev.yml up --build
```

3. Приложение будет доступно на:
   - API: http://localhost:3000/api
   - Swagger: http://localhost:3000/api/docs
   - Database: localhost:5432

4. Остановка сервисов:

```bash
npm run docker:dev:down
```

или

```bash
docker-compose -f docker-compose.dev.yml down
```

## Production сборка

1. Соберите образ:

```bash
docker build -t backend-dilemma .
```

2. Запустите контейнер:

```bash
docker run -p 3000:3000 --env-file .env.production backend-dilemma
```

## Структура файлов

- `Dockerfile` - Production образ с multi-stage build
- `Dockerfile.dev` - Development образ с поддержкой hot reload
- `docker-compose.dev.yml` - Конфигурация для локальной разработки
- `.dockerignore` - Файлы, исключаемые из Docker контекста

## Особенности

- **Hot Reload**: Изменения в `src/` автоматически перезагружают приложение
- **Health Checks**: База данных имеет health check для корректного запуска
- **Volumes**: Исходный код монтируется как volume для development режима
- **pnpm**: Внутри контейнера используется pnpm (corepack), пакет-lock не нужен

## Переменные окружения

Все переменные окружения настраиваются через `.env.development` файл. Пример файла можно найти в `.env.development.example`.

## Troubleshooting

### Порт уже занят

Если порт 3000 или 5432 занят, измените порты в `docker-compose.dev.yml`:

```yaml
ports:
  - "3001:3000"  # Внешний:Внутренний
```

### Проблемы с node_modules

Если возникают проблемы с нативными модулями, убедитесь что `node_modules` не монтируется как volume (это уже настроено в docker-compose.dev.yml).

### База данных не запускается

Проверьте логи:

```bash
docker-compose -f docker-compose.dev.yml logs dev-db
```

### Очистка volumes

Для полной очистки данных базы данных:

```bash
docker-compose -f docker-compose.dev.yml down -v
```
