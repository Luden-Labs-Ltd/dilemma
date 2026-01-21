# Stage 1: Builder - сборка приложения
FROM node:22-alpine AS builder

WORKDIR /app

# Устанавливаем необходимые зависимости для компиляции нативных модулей
RUN apk add --no-cache python3 make g++

# Копируем файлы зависимостей
COPY backend-dilemma/package.json backend-dilemma/yarn.lock ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN yarn install --frozen-lockfile

# Копируем исходный код и конфигурационные файлы
COPY backend-dilemma/tsconfig.json backend-dilemma/nest-cli.json ./
COPY backend-dilemma/src ./src

# Собираем приложение
RUN yarn build

# Stage 2: Production - финальный образ
FROM node:22-alpine AS production

WORKDIR /app

# Устанавливаем только runtime зависимости для нативных модулей
RUN apk add --no-cache python3 make g++

# Копируем файлы зависимостей
COPY backend-dilemma/package.json backend-dilemma/yarn.lock ./

# Устанавливаем только production зависимости
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Копируем собранное приложение из builder stage
COPY --from=builder /app/dist ./dist

# Удаляем build tools после установки зависимостей
RUN apk del python3 make g++


EXPOSE 4000

# Запускаем приложение в production режиме
CMD ["yarn", "start:prod"]
