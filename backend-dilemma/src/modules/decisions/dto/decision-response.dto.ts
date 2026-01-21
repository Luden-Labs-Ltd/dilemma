import { ApiProperty } from '@nestjs/swagger';

export class DecisionResponseDto {
  @ApiProperty()
  decisionId: number;

  @ApiProperty({ enum: ['A', 'B'] })
  initialChoice: 'A' | 'B';

  @ApiProperty({ enum: ['A', 'B'] })
  finalChoice: 'A' | 'B';

  @ApiProperty()
  changedMind: boolean;

  @ApiProperty({ enum: ['AA', 'AB', 'BB', 'BA'] })
  path: 'AA' | 'AB' | 'BB' | 'BA';

  @ApiProperty()
  timeToDecide: number;
}
