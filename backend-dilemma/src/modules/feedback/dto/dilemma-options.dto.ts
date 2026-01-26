import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DilemmaOptionsDto {
  @ApiProperty({
    example: 'ADOPT MACHINE RECOMMENDATION\nSilence to Save Lives',
    description: 'Option A text',
  })
  @IsString()
  @IsNotEmpty()
  a: string;

  @ApiProperty({
    example: 'BROADCAST ALERT\nTruth at Any Cost',
    description: 'Option B text',
  })
  @IsString()
  @IsNotEmpty()
  b: string;
}
