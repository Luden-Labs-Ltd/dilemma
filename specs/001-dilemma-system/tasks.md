# Tasks: Система дилем с фиксацией изменений решений

## Overview

Детальный список задач для реализации системы дилем. Задачи организованы по фазам и user stories, упорядочены с учетом зависимостей.

## Legend

- `[P]` - Задача может выполняться параллельно
- `[TDD]` - Требует TDD подхода (тесты перед реализацией)

## Phase 1: Project Setup

### T001: Initialize NestJS project structure
**Type**: Setup  
**Files**:
- `backend-dilemma/package.json`
- `backend-dilemma/tsconfig.json`
- `backend-dilemma/nest-cli.json`

**Description**: Настроить базовую структуру NestJS проекта, установить зависимости

**Dependencies**: None

**Completion Criteria**:
- [ ] NestJS проект инициализирован
- [ ] Все зависимости установлены (NestJS, TypeORM, PostgreSQL, class-validator, swagger)
- [ ] TypeScript настроен в strict mode
- [ ] Проект компилируется

### T002: Setup TypeORM and PostgreSQL configuration
**Type**: Setup  
**Files**:
- `backend-dilemma/src/config/database.config.ts`
- `backend-dilemma/src/app.module.ts`

**Description**: Настроить подключение к PostgreSQL через TypeORM

**Dependencies**: T001

**Completion Criteria**:
- [ ] TypeORM настроен
- [ ] Конфигурация базы данных создана
- [ ] Подключение к БД работает

### T003: Setup testing infrastructure
**Type**: Setup  
**Files**:
- `backend-dilemma/test/jest-e2e.json`
- `backend-dilemma/jest.config.js`

**Description**: Настроить Jest и Supertest для unit и E2E тестов

**Dependencies**: T001

**Completion Criteria**:
- [ ] Jest настроен
- [ ] Supertest настроен
- [ ] Тестовые скрипты работают

## Phase 2: Database Schema & Entities

### T004: Create User entity
**Type**: Entity  
**Files**:
- `backend-dilemma/src/modules/users/entities/user.entity.ts`

**Description**: Создать User entity с полями: id (UUID), client_uuid (UUID), created_at, last_active

**Dependencies**: T002

**Completion Criteria**:
- [ ] User entity создан
- [ ] Все поля определены
- [ ] Индексы настроены

### T005: Create Dilemma entity
**Type**: Entity  
**Files**:
- `backend-dilemma/src/modules/dilemmas/entities/dilemma.entity.ts`

**Description**: Создать Dilemma entity со всеми полями из спецификации

**Dependencies**: T002

**Completion Criteria**:
- [ ] Dilemma entity создан
- [ ] Все поля определены
- [ ] Индексы настроены

### T006: Create UserDecision entity
**Type**: Entity  
**Files**:
- `backend-dilemma/src/modules/decisions/entities/user-decision.entity.ts`

**Description**: Создать UserDecision entity с relationships к User и Dilemma

**Dependencies**: T004, T005

**Completion Criteria**:
- [ ] UserDecision entity создан
- [ ] Relationships настроены
- [ ] Unique constraint на (user_id, dilemma_id)
- [ ] Индексы настроены

### T007: Create database migration
**Type**: Migration  
**Files**:
- `backend-dilemma/migrations/001-initial-schema.ts`

**Description**: Создать миграцию для всех таблиц

**Dependencies**: T004, T005, T006

**Completion Criteria**:
- [ ] Миграция создана
- [ ] Все таблицы создаются
- [ ] Индексы и constraints применены

### T008: Create seed data migration
**Type**: Migration  
**Files**:
- `backend-dilemma/migrations/002-seed-dilemmas.ts`

**Description**: Создать seed данные для 3 начальных дилем

**Dependencies**: T007

**Completion Criteria**:
- [ ] Seed миграция создана
- [ ] 3 дилемы добавлены в БД

## Phase 3: Users Module

### T009: Create UsersModule structure
**Type**: Module  
**Files**:
- `backend-dilemma/src/modules/users/users.module.ts`
- `backend-dilemma/src/modules/users/users.service.ts`
- `backend-dilemma/src/modules/users/users.controller.ts`

**Description**: Создать структуру модуля Users

**Dependencies**: T004

**Completion Criteria**:
- [ ] Модуль создан
- [ ] Service и Controller созданы
- [ ] Модуль зарегистрирован в AppModule

### T010: Implement user lookup/create by client_uuid
**Type**: Service  
**Files**:
- `backend-dilemma/src/modules/users/users.service.ts`

**Description**: Реализовать логику поиска/создания пользователя по client_uuid

**Dependencies**: T009

**Completion Criteria**:
- [ ] Метод findOrCreateByClientUuid реализован
- [ ] Обновляется last_active при обращении

### T011: Create UUID validation decorator/guard
**Type**: Common  
**Files**:
- `backend-dilemma/src/common/decorators/user-uuid.decorator.ts`
- `backend-dilemma/src/common/guards/uuid-validation.guard.ts`

**Description**: Создать декоратор для извлечения UUID из заголовка и guard для валидации

**Dependencies**: None

**Completion Criteria**:
- [ ] Декоратор @UserUuid() создан
- [ ] Guard валидирует UUID формат
- [ ] Guard применяется к нужным endpoints

## Phase 4: Dilemmas Module (User Story 1)

### T012: Create DilemmasModule structure
**Type**: Module  
**Files**:
- `backend-dilemma/src/modules/dilemmas/dilemmas.module.ts`
- `backend-dilemma/src/modules/dilemmas/dilemmas.service.ts`
- `backend-dilemma/src/modules/dilemmas/dilemmas.controller.ts`

**Description**: Создать структуру модуля Dilemmas

**Dependencies**: T005

**Completion Criteria**:
- [ ] Модуль создан
- [ ] Service и Controller созданы
- [ ] Модуль зарегистрирован в AppModule

### T013: Create DTOs for dilemmas
**Type**: DTO  
**Files**:
- `backend-dilemma/src/modules/dilemmas/dto/dilemma-list-item.dto.ts`
- `backend-dilemma/src/modules/dilemmas/dto/dilemma-details.dto.ts`

**Description**: Создать DTOs для запросов и ответов

**Dependencies**: T012

**Completion Criteria**:
- [ ] DTOs созданы
- [ ] Валидация настроена

### T014: Implement GET /api/dilemmas
**Type**: Controller  
**Files**:
- `backend-dilemma/src/modules/dilemmas/dilemmas.controller.ts`
- `backend-dilemma/src/modules/dilemmas/dilemmas.service.ts`

**Description**: Реализовать endpoint для списка активных дилем

**Dependencies**: T013

**Completion Criteria**:
- [ ] Endpoint реализован
- [ ] Возвращает только активные дилемы
- [ ] Включает participant_count

### T015: Implement GET /api/dilemmas/{name}
**Type**: Controller  
**Files**:
- `backend-dilemma/src/modules/dilemmas/dilemmas.controller.ts`
- `backend-dilemma/src/modules/dilemmas/dilemmas.service.ts`

**Description**: Реализовать endpoint для деталей дилемы с проверкой участия

**Dependencies**: T014, T010

**Completion Criteria**:
- [ ] Endpoint реализован
- [ ] Проверяет участие пользователя (если UUID передан)
- [ ] Возвращает полную информацию о дилеме

### T016: [TDD] Write unit tests for DilemmasService
**Type**: Test  
**Files**:
- `backend-dilemma/src/modules/dilemmas/dilemmas.service.spec.ts`

**Description**: Написать unit тесты для бизнес-логики

**Dependencies**: T015

**Completion Criteria**:
- [ ] Тесты написаны
- [ ] Покрытие >80%
- [ ] Все тесты проходят

### T017: Write E2E tests for dilemmas endpoints
**Type**: Test  
**Files**:
- `backend-dilemma/test/dilemmas.e2e-spec.ts`

**Description**: Написать E2E тесты для API endpoints

**Dependencies**: T015

**Completion Criteria**:
- [ ] E2E тесты написаны
- [ ] Все сценарии покрыты
- [ ] Тесты проходят

## Phase 5: Decisions Module - Initial Choice (User Story 2)

### T018: Create DecisionsModule structure
**Type**: Module  
**Files**:
- `backend-dilemma/src/modules/decisions/decisions.module.ts`
- `backend-dilemma/src/modules/decisions/decisions.service.ts`
- `backend-dilemma/src/modules/decisions/decisions.controller.ts`

**Description**: Создать структуру модуля Decisions

**Dependencies**: T006

**Completion Criteria**:
- [ ] Модуль создан
- [ ] Service и Controller созданы
- [ ] Модуль зарегистрирован в AppModule

### T019: Create DTOs for decisions
**Type**: DTO  
**Files**:
- `backend-dilemma/src/modules/decisions/dto/initial-choice.dto.ts`
- `backend-dilemma/src/modules/decisions/dto/final-choice.dto.ts`
- `backend-dilemma/src/modules/decisions/dto/feedback-response.dto.ts`
- `backend-dilemma/src/modules/decisions/dto/decision-response.dto.ts`

**Description**: Создать DTOs с валидацией

**Dependencies**: T018

**Completion Criteria**:
- [ ] DTOs созданы
- [ ] Валидация choice (A или B)
- [ ] Валидация dilemmaName

### T020: Implement POST /api/decisions/initial
**Type**: Controller  
**Files**:
- `backend-dilemma/src/modules/decisions/decisions.controller.ts`
- `backend-dilemma/src/modules/decisions/decisions.service.ts`

**Description**: Реализовать создание initial choice

**Dependencies**: T019, T010

**Completion Criteria**:
- [ ] Endpoint реализован
- [ ] Создает UserDecision с initial_choice
- [ ] Проверяет что пользователь еще не участвовал
- [ ] Возвращает соответствующий feedback

### T021: [TDD] Write unit tests for initial choice logic
**Type**: Test  
**Files**:
- `backend-dilemma/src/modules/decisions/decisions.service.spec.ts`

**Description**: Написать тесты для бизнес-логики initial choice

**Dependencies**: T020

**Completion Criteria**:
- [ ] Тесты написаны
- [ ] Покрытие >80%
- [ ] Все тесты проходят

### T022: Write E2E tests for initial choice endpoint
**Type**: Test  
**Files**:
- `backend-dilemma/test/decisions.e2e-spec.ts`

**Description**: Написать E2E тесты

**Dependencies**: T020

**Completion Criteria**:
- [ ] E2E тесты написаны
- [ ] Все сценарии покрыты
- [ ] Тесты проходят

## Phase 6: Decisions Module - Final Choice (User Story 3)

### T023: Implement POST /api/decisions/final
**Type**: Controller  
**Files**:
- `backend-dilemma/src/modules/decisions/decisions.controller.ts`
- `backend-dilemma/src/modules/decisions/decisions.service.ts`

**Description**: Реализовать финальный выбор с расчетом changed_mind и time_to_decide

**Dependencies**: T020

**Completion Criteria**:
- [ ] Endpoint реализован
- [ ] Обновляет final_choice
- [ ] Вычисляет changed_mind (initial != final)
- [ ] Вычисляет time_to_decide в секундах
- [ ] Валидирует что initial choice существует
- [ ] Валидирует что final choice еще не установлен

### T024: [TDD] Write unit tests for final choice calculations
**Type**: Test  
**Files**:
- `backend-dilemma/src/modules/decisions/decisions.service.spec.ts`

**Description**: Написать тесты для расчетов changed_mind и time_to_decide

**Dependencies**: T023

**Completion Criteria**:
- [ ] Тесты для всех 4 траекторий (AA, AB, BB, BA)
- [ ] Тесты для time_to_decide
- [ ] Все тесты проходят

### T025: Write E2E tests for final choice endpoint
**Type**: Test  
**Files**:
- `backend-dilemma/test/decisions.e2e-spec.ts`

**Description**: Написать E2E тесты для final choice

**Dependencies**: T023

**Completion Criteria**:
- [ ] E2E тесты написаны
- [ ] Все сценарии покрыты
- [ ] Тесты проходят

## Phase 7: Personal Statistics (User Story 4)

### T026: Implement GET /api/decisions/my
**Type**: Controller  
**Files**:
- `backend-dilemma/src/modules/decisions/decisions.controller.ts`
- `backend-dilemma/src/modules/decisions/decisions.service.ts`

**Description**: Реализовать получение истории решений пользователя

**Dependencies**: T023

**Completion Criteria**:
- [ ] Endpoint реализован
- [ ] Возвращает все решения пользователя
- [ ] Вычисляет path (AA, AB, BB, BA) для каждого
- [ ] Включает информацию о дилемах

### T027: Write tests for personal statistics
**Type**: Test  
**Files**:
- `backend-dilemma/src/modules/decisions/decisions.service.spec.ts`
- `backend-dilemma/test/decisions.e2e-spec.ts`

**Description**: Написать тесты для личной статистики

**Dependencies**: T026

**Completion Criteria**:
- [ ] Unit тесты написаны
- [ ] E2E тесты написаны
- [ ] Все тесты проходят

## Phase 8: Statistics Module (User Story 5)

### T028: Create StatisticsModule structure
**Type**: Module  
**Files**:
- `backend-dilemma/src/modules/statistics/statistics.module.ts`
- `backend-dilemma/src/modules/statistics/statistics.service.ts`
- `backend-dilemma/src/modules/statistics/statistics.controller.ts`

**Description**: Создать структуру модуля Statistics

**Dependencies**: T006

**Completion Criteria**:
- [ ] Модуль создан
- [ ] Service и Controller созданы
- [ ] Модуль зарегистрирован в AppModule

### T029: Create statistics DTOs
**Type**: DTO  
**Files**:
- `backend-dilemma/src/modules/statistics/dto/statistics-response.dto.ts`

**Description**: Создать DTO для статистики

**Dependencies**: T028

**Completion Criteria**:
- [ ] DTO создан
- [ ] Включает все поля из спецификации

### T030: Implement statistics aggregation logic
**Type**: Service  
**Files**:
- `backend-dilemma/src/modules/statistics/statistics.service.ts`

**Description**: Реализовать агрегацию по 4 путям (AA, AB, BB, BA)

**Dependencies**: T029

**Completion Criteria**:
- [ ] Агрегация по путям реализована
- [ ] Расчет процентов
- [ ] Расчет change_rate
- [ ] Расчет avg_time_to_decide
- [ ] Только завершенные участия (с final_choice)

### T031: Implement caching for statistics
**Type**: Service  
**Files**:
- `backend-dilemma/src/modules/statistics/statistics.service.ts`

**Description**: Реализовать кэширование статистики (TTL: 5 минут)

**Dependencies**: T030

**Completion Criteria**:
- [ ] Кэширование реализовано
- [ ] TTL: 5 минут
- [ ] Инвалидация при новых решениях

### T032: Implement GET /api/statistics/dilemma/{name}
**Type**: Controller  
**Files**:
- `backend-dilemma/src/modules/statistics/statistics.controller.ts`
- `backend-dilemma/src/modules/statistics/statistics.service.ts`

**Description**: Реализовать endpoint для статистики

**Dependencies**: T031

**Completion Criteria**:
- [ ] Endpoint реализован
- [ ] Использует кэш
- [ ] Возвращает полную статистику

### T033: [TDD] Write unit tests for statistics
**Type**: Test  
**Files**:
- `backend-dilemma/src/modules/statistics/statistics.service.spec.ts`

**Description**: Написать тесты для статистики

**Dependencies**: T032

**Completion Criteria**:
- [ ] Тесты для всех расчетов
- [ ] Тесты для кэширования
- [ ] Все тесты проходят

### T034: Write E2E tests for statistics endpoint
**Type**: Test  
**Files**:
- `backend-dilemma/test/statistics.e2e-spec.ts`

**Description**: Написать E2E тесты

**Dependencies**: T032

**Completion Criteria**:
- [ ] E2E тесты написаны
- [ ] Все сценарии покрыты
- [ ] Тесты проходят

## Phase 9: Polish & Documentation

### T035: Add Swagger/OpenAPI documentation
**Type**: Documentation  
**Files**:
- `backend-dilemma/src/main.ts`
- All controller files

**Description**: Настроить Swagger и добавить документацию ко всем endpoints

**Dependencies**: All previous phases

**Completion Criteria**:
- [ ] Swagger настроен
- [ ] Все endpoints задокументированы
- [ ] Примеры запросов/ответов добавлены

### T036: Add global exception filters
**Type**: Common  
**Files**:
- `backend-dilemma/src/common/filters/http-exception.filter.ts`
- `backend-dilemma/src/main.ts`

**Description**: Создать глобальный exception filter для структурированных ошибок

**Dependencies**: None

**Completion Criteria**:
- [ ] Exception filter создан
- [ ] Применен глобально
- [ ] Все ошибки структурированы

### T037: Add request logging
**Type**: Common  
**Files**:
- `backend-dilemma/src/common/interceptors/logging.interceptor.ts`
- `backend-dilemma/src/main.ts`

**Description**: Добавить логирование запросов

**Dependencies**: None

**Completion Criteria**:
- [ ] Logging interceptor создан
- [ ] Логирует все запросы
- [ ] Включает UUID пользователя

### T038: Optimize database queries
**Type**: Optimization  
**Files**:
- All service files

**Description**: Оптимизировать запросы, убедиться что индексы используются

**Dependencies**: All previous phases

**Completion Criteria**:
- [ ] Запросы оптимизированы
- [ ] Индексы используются
- [ ] N+1 проблемы решены

## Summary

- **Total Tasks**: 38
- **Setup Tasks**: 3
- **Entity Tasks**: 5
- **Module Tasks**: 4 modules
- **Test Tasks**: 8
- **Polish Tasks**: 4

**MVP Scope**: Phases 1-6 (User Stories 1-3) - основные функции для принятия решений
