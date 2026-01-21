import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { PathStatsDto } from './dto/path-stats.dto';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('paths/:name')
  @ApiOperation({
    summary: 'Получить статистику путей (AA, AB, BA, BB) по дилеме',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешное получение статистики путей',
    type: PathStatsDto,
  })
  @ApiResponse({ status: 404, description: 'Dilemma not found' })
  async getPathStats(@Param('name') name: string): Promise<PathStatsDto> {
    return this.statisticsService.getPathStatsByDilemmaName(name);
  }
}
