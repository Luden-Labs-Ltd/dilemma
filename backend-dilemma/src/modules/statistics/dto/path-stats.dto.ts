import { ApiProperty } from '@nestjs/swagger';

export class PathStatsDto {
  @ApiProperty({
    description: 'Count per trajectory (AA, AB, AC, …). Keys depend on dilemma options count.',
    example: { AA: 5, AB: 2, AC: 1, BA: 3, BB: 4, BC: 0, CA: 1, CB: 0, CC: 2 },
  })
  pathCounts: Record<string, number>;

  @ApiProperty({
    description: 'Total completed participants (final_choice != null)',
    example: 18,
  })
  totalCompleted: number;
}

