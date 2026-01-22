import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional, MaxLength } from 'class-validator';

export class FeedbackRequestDto {
  @ApiProperty({
    example: 'dilemma1',
    description: 'Name of the dilemma',
  })
  @IsString()
  @IsNotEmpty()
  dilemmaName: string;

  @ApiProperty({
    example: 'A',
    enum: ['A', 'B'],
    description: "User's choice (A or B)",
  })
  @IsIn(['A', 'B'])
  choice: 'A' | 'B';

  @ApiProperty({
    example: 'Мне нужны деньги сейчас, поэтому я оставлю кошелек себе',
    description: "User's reasoning for the choice (optional, max 5000 characters)",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  reasoning?: string;
}
