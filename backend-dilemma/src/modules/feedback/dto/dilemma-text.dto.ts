import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DilemmaOptionsDto } from './dilemma-options.dto';

export class DilemmaTextDto {
  @ApiProperty({
    example: 'Strategic Silence',
    description: 'Title of the dilemma',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Military Dilemma',
    description: 'Subtitle of the dilemma',
    required: false,
  })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({
    example: 'What is your command?',
    description: 'Question text for the dilemma',
    required: false,
  })
  @IsString()
  @IsOptional()
  questionText?: string;

  @ApiProperty({
    example: 'You are a commander in Unit 8200. The Prophet system predicts a mass disaster in 48 hours.',
    description: 'Description of the dilemma',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Point to consider: Do you listen to the machine\'s mathematics which saves lives, or act according to human morality which demands truth?',
    description: 'Reflection text for the dilemma',
    required: false,
  })
  @IsString()
  @IsOptional()
  reflectionText?: string;

  @ApiProperty({
    type: DilemmaOptionsDto,
    description: 'Options for the dilemma',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DilemmaOptionsDto)
  options: DilemmaOptionsDto;
}
