import { ApiProperty } from '@nestjs/swagger';

export class OptionDto {
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

  @ApiProperty()
  optionA: OptionDto;

  @ApiProperty()
  optionB: OptionDto;

  @ApiProperty()
  hasParticipated: boolean;
}
