import { ApiProperty } from '@nestjs/swagger';

export class FeedbackResponseDto {
  @ApiProperty()
  decisionId: number;

  @ApiProperty()
  feedback: string;
}
