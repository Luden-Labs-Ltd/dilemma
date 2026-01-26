# Quickstart: Расширение контекста для AI-фидбэка

**Feature**: `005-enhance-ai-context`  
**Date**: 2026-01-26

## Overview

Расширение функциональности AI-фидбэка для улучшения качества анализа за счет включения дополнительного контекста. Клиент передает переводы дилеммы на текущем языке пользователя и оригинальный английский текст в теле запроса.

## Key Changes

### Backend Changes

1. **Расширение FeedbackRequestDto**:
   - Добавлены опциональные поля `dilemmaText` и `dilemmaTextOriginal`
   - Создан новый класс `DilemmaTextDto` для структуры текста дилеммы

2. **Обновление FeedbackService.buildPrompt**:
   - Логика построения промпта расширена для использования новых полей
   - Добавлена поддержка оригинального английского текста в промпте
   - Сохранена обратная совместимость с существующими запросами

### Frontend Changes

1. **Обновление API клиента**:
   - Функция `fetchFeedbackAnalyze` должна передавать новые поля
   - Извлечение данных из translation.json для передачи в запросе

## Implementation Steps

### Step 1: Backend - Создание DilemmaTextDto

Создать новый DTO класс в `backend-dilemma/src/modules/feedback/dto/dilemma-text.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DilemmaOptionsDto {
  @ApiProperty({ example: 'ADOPT MACHINE RECOMMENDATION\nSilence to Save Lives' })
  @IsString()
  @IsNotEmpty()
  a: string;

  @ApiProperty({ example: 'BROADCAST ALERT\nTruth at Any Cost' })
  @IsString()
  @IsNotEmpty()
  b: string;
}

export class DilemmaTextDto {
  @ApiProperty({ example: 'Strategic Silence' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Military Dilemma', required: false })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({ example: 'What is your command?', required: false })
  @IsString()
  @IsOptional()
  questionText?: string;

  @ApiProperty({ example: 'You are a commander in Unit 8200...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Point to consider...', required: false })
  @IsString()
  @IsOptional()
  reflectionText?: string;

  @ApiProperty({ type: DilemmaOptionsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DilemmaOptionsDto)
  options: DilemmaOptionsDto;
}
```

### Step 2: Backend - Расширение FeedbackRequestDto

Обновить `backend-dilemma/src/modules/feedback/dto/feedback-request.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DilemmaTextDto } from './dilemma-text.dto';

export class FeedbackRequestDto {
  // ... existing fields ...

  @ApiProperty({ type: DilemmaTextDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DilemmaTextDto)
  dilemmaText?: DilemmaTextDto;

  @ApiProperty({ type: DilemmaTextDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DilemmaTextDto)
  dilemmaTextOriginal?: DilemmaTextDto;
}
```

### Step 3: Backend - Обновление buildPrompt метода

Обновить `backend-dilemma/src/modules/feedback/feedback.service.ts`:

```typescript
private async buildPrompt(
  dilemma: Dilemma,
  choice: 'A' | 'B',
  reasoning?: string,
  lang = 'he',
  dilemmaText?: DilemmaTextDto,
  dilemmaTextOriginal?: DilemmaTextDto,
): Promise<string> {
  // Если передан dilemmaText, использовать его, иначе fallback на i18n
  const useClientText = !!dilemmaText;
  
  // ... existing prompt building logic with support for new fields ...
  
  // Добавить оригинальный английский текст, если передан
  if (dilemmaTextOriginal) {
    prompt += `\n\n--- Original English Text ---\n`;
    prompt += `Title: ${dilemmaTextOriginal.title}\n`;
    // ... add other fields ...
  }
  
  return prompt;
}
```

### Step 4: Frontend - Обновление API клиента

Обновить `frontend-dilemma/src/shared/lib/api.ts`:

```typescript
export async function fetchFeedbackAnalyze(
  dilemmaName: DilemmaType,
  choice: Choice,
  reasoning?: string,
  dilemmaText?: DilemmaTextData,
  dilemmaTextOriginal?: DilemmaTextData
): Promise<string[]> {
  // ... existing code ...
  
  const payload: FeedbackRequestPayload = {
    dilemmaName: String(dilemmaName),
    choice: choiceValue,
  };
  
  if (reasoning != null && reasoning.trim() !== "") {
    payload.reasoning = reasoning.trim();
  }
  
  if (dilemmaText) {
    payload.dilemmaText = dilemmaText;
  }
  
  if (dilemmaTextOriginal) {
    payload.dilemmaTextOriginal = dilemmaTextOriginal;
  }
  
  // ... rest of the code ...
}
```

### Step 5: Frontend - Извлечение данных из translation.json

В компоненте, который вызывает `fetchFeedbackAnalyze`, извлечь данные из translation.json:

```typescript
import { useTranslation } from 'react-i18next';
import enTranslations from '@/shared/i18n/locales/en/translation.json';

// В компоненте:
const { i18n } = useTranslation();
const currentLang = i18n.language;

// Получить переводы для текущего языка
const dilemmaData = translations[currentLang]?.dilemmas[dilemmaName];

// Получить оригинальный английский текст
const originalData = enTranslations.dilemmas[dilemmaName];

// Передать в API
await fetchFeedbackAnalyze(
  dilemmaName,
  choice,
  reasoning,
  dilemmaData,
  originalData
);
```

## Testing

### Unit Tests

Обновить `backend-dilemma/src/modules/feedback/feedback.service.spec.ts`:

```typescript
describe('buildPrompt with enhanced context', () => {
  it('should include original English text when provided', async () => {
    const dilemmaText = { /* ... */ };
    const dilemmaTextOriginal = { /* ... */ };
    const prompt = await service.buildPrompt(
      dilemma,
      'A',
      'reasoning',
      'he',
      dilemmaText,
      dilemmaTextOriginal
    );
    expect(prompt).toContain('Original English Text');
  });
  
  it('should fallback to i18n when dilemmaText not provided', async () => {
    const prompt = await service.buildPrompt(dilemma, 'A', undefined, 'he');
    // Should use existing i18n logic
  });
});
```

### E2E Tests

Обновить `backend-dilemma/test/feedback.e2e-spec.ts`:

```typescript
it('POST /feedback/analyze with translations', () => {
  return request(app.getHttpServer())
    .post('/api/feedback/analyze')
    .set('X-User-UUID', userUuid)
    .send({
      dilemmaName: 'trolley-problem',
      choice: 'A',
      dilemmaText: { /* ... */ },
      dilemmaTextOriginal: { /* ... */ }
    })
    .expect(200)
    .expect((res) => {
      expect(res.body.counterArguments).toBeInstanceOf(Array);
    });
});
```

## Migration Path

1. **Phase 1**: Backend изменения (обратная совместимость сохранена)
2. **Phase 2**: Frontend обновление (постепенная миграция клиентов)
3. **Phase 3**: Удаление fallback логики (опционально, после полной миграции)

## Rollback Plan

Если требуется откат:
1. Удалить новые поля из DTO (оставить опциональными)
2. Вернуть старую логику buildPrompt
3. Frontend продолжит работать без новых полей

## Dependencies

- Нет новых зависимостей
- Используются существующие: class-validator, class-transformer, nestjs-i18n
