import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersCountDto } from './dto/users-count.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('count')
  @ApiOperation({ summary: 'Количество пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Общее количество пользователей',
    type: UsersCountDto,
  })
  async getCount(): Promise<UsersCountDto> {
    const count = await this.usersService.getCount();
    return { count };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => ({
      id: user.id,
      clientUuid: user.client_uuid,
      createdAt: user.created_at,
      lastActive: user.last_active,
    }));
  }
}
