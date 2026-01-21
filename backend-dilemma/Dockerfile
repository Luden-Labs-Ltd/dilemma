# Stage 1: Builder - сборка приложения
FROM node:22-alpine AS builder

WORKDIR /app

# Устанавливаем необходимые зависимости для компиляции нативных модулей
RUN apk add --no-cache python3 make g++ \
  && corepack enable

# Копируем файлы зависимостей
COPY package.json pnpm-lock.yaml* ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN pnpm install --frozen-lockfile=false

# Копируем исходный код и конфигурационные файлы
COPY tsconfig.json nest-cli.json ./
COPY src ./src

# Собираем приложение
RUN pnpm run build

# Stage 2: Production - финальный образ
FROM node:22-alpine AS production

WORKDIR /app

# Устанавливаем только runtime зависимости для нативных модулей
RUN apk add --no-cache python3 make g++ \
  && corepack enable

# Копируем файлы зависимостей
COPY package.json pnpm-lock.yaml* ./

# Устанавливаем только production зависимости
RUN pnpm install --prod --frozen-lockfile=false && \
    pnpm store prune

# Копируем собранное приложение из builder stage
COPY --from=builder /app/dist ./dist

# Удаляем build tools после установки зависимостей
RUN apk del python3 make g++

EXPOSE 3000

# Запускаем приложение в production режиме
CMD ["pnpm", "run", "start:prod"]
