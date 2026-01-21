import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class FinalChoiceDto {
  @ApiProperty({ example: 'dilemma1' })
  @IsString()
  dilemmaName: string;

  @ApiProperty({ example: 'B', enum: ['A', 'B'] })
  @IsIn(['A', 'B'])
  choice: 'A' | 'B';
}
