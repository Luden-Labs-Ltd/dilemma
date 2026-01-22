import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class FeedbackResponseDto {
  @ApiProperty({
    example: [
      'Это решение игнорирует морально-этическую сторону вопроса: найденное следует возвращать, чтобы поступать справедливо.',
      'Оставить кошелёк может привести к чувству вины или нежелательным последствиям, если владелец обнаружит потерю.',
    ],
    description: 'Array of counter-arguments explaining why the choice might be wrong',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  counterArguments: string[];
}
