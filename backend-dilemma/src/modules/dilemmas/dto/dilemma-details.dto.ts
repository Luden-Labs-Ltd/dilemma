import { ApiProperty } from '@nestjs/swagger';

export class OptionDto {
  @ApiProperty({ description: 'Option letter (A, B, C, …)' })
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;
}

export class DilemmaDetailsDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [OptionDto], description: '2–10 options in order A, B, C, …' })
  options: OptionDto[];

  @ApiProperty()
  hasParticipated: boolean;
}
