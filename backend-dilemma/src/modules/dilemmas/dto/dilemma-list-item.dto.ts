import { ApiProperty } from '@nestjs/swagger';

export class DilemmaListItemDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  participantCount: number;
}
