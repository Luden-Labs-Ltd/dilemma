import { ApiProperty } from '@nestjs/swagger';

export class DecisionResponseDto {
  @ApiProperty()
  decisionId: number;

  @ApiProperty({ description: 'Initial choice letter (A–J)' })
  initialChoice: string;

  @ApiProperty({ description: 'Final choice letter (A–J)' })
  finalChoice: string;

  @ApiProperty()
  changedMind: boolean;

  @ApiProperty({ description: 'Two-letter trajectory, e.g. AA, AC, CB' })
  path: string;

  @ApiProperty()
  timeToDecide: number;
}
