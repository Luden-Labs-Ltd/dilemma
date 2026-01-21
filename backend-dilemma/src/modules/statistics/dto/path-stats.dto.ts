import { ApiProperty } from '@nestjs/swagger';

export class PathStatsDto {
  @ApiProperty({ example: 20, description: 'Количество участников с путём AA' })
  AA: number;

  @ApiProperty({ example: 10, description: 'Количество участников с путём AB' })
  AB: number;

  @ApiProperty({ example: 5, description: 'Количество участников с путём BA' })
  BA: number;

  @ApiProperty({ example: 7, description: 'Количество участников с путём BB' })
  BB: number;

  @ApiProperty({
    example: 42,
    description: 'Общее количество завершённых участников (final_choice != null)',
  })
  totalCompleted: number;
}

