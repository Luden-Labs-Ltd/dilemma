import { ApiProperty } from '@nestjs/swagger';

export class TotalAnswersCountDto {
  @ApiProperty({
    description: 'Общее количество ответов (завершённых решений) по всем дилемам',
    example: 42,
  })
  total: number;
}

export class DilemmaAnswersCountDto {
  @ApiProperty({
    description: 'Имя дилемы',
    example: 'doctor',
  })
  dilemmaName: string;

  @ApiProperty({
    description: 'Количество ответов по этой дилеме (завершённых решений)',
    example: 15,
  })
  count: number;
}
