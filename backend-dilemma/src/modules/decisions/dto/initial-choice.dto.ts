import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeChoiceLetter } from '../../../common/constants';

const VALID_CHOICES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] as const;
export type ChoiceLetter = (typeof VALID_CHOICES)[number];

export class InitialChoiceDto {
  @ApiProperty({ example: 'medical' })
  @IsString()
  dilemmaName: string;

  @ApiProperty({ example: 'A', enum: VALID_CHOICES })
  @Transform(({ value }) => normalizeChoiceLetter(value))
  @IsIn(VALID_CHOICES)
  choice: ChoiceLetter;
}
