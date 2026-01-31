import { ApiProperty } from '@nestjs/swagger';

export class MyDecisionItemDto {
  @ApiProperty({ description: 'Dilemma name' })
  dilemmaName: string;

  @ApiProperty({ description: 'Initial choice (A–J)' })
  initialChoice: string;

  @ApiProperty({ description: 'Final choice (A–J) or null if not yet set' })
  finalChoice: string | null;

  @ApiProperty({ description: 'Two-letter path (e.g. AA, AC) or null' })
  path: string | null;

  @ApiProperty({ description: 'Whether user changed mind' })
  changedMind?: boolean;

  @ApiProperty({ description: 'Seconds between initial and final choice' })
  timeToDecide?: number;
}
