import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class InitialChoiceDto {
  @ApiProperty({ example: 'dilemma1' })
  @IsString()
  dilemmaName: string;

  @ApiProperty({ example: 'A', enum: ['A', 'B'] })
  @IsIn(['A', 'B'])
  choice: 'A' | 'B';
}
