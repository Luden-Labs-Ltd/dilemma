import { ApiProperty } from '@nestjs/swagger';

export class UsersCountDto {
  @ApiProperty({
    description: 'Количество пользователей',
    example: 128,
  })
  count: number;
}
