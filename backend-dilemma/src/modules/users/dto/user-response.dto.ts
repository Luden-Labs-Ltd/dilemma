import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  clientUuid: string;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-19T17:40:00.000Z' })
  lastActive: Date;
}
