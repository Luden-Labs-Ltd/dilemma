import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { PathStatsDto } from './dto/path-stats.dto';
import {
  TotalAnswersCountDto,
  DilemmaAnswersCountDto,
} from './dto/answers-count.dto';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('answers')
  @ApiOperation({
    summary: 'Общее количество ответов по всем дилемам',
  })
  @ApiResponse({
    status: 200,
    description: 'Всего завершённых ответов (final_choice) по всем дилемам',
    type: TotalAnswersCountDto,
  })
  async getTotalAnswersCount(): Promise<TotalAnswersCountDto> {
    return this.statisticsService.getTotalAnswersCount();
  }

  @Get('answers/:name')
  @ApiOperation({
    summary: 'Количество ответов по одной дилеме',
  })
  @ApiResponse({
    status: 200,
    description: 'Количество завершённых ответов по указанной дилеме',
    type: DilemmaAnswersCountDto,
  })
  @ApiResponse({ status: 404, description: 'Dilemma not found' })
  async getAnswersCountByDilemma(
    @Param('name') name: string,
  ): Promise<DilemmaAnswersCountDto> {
    return this.statisticsService.getAnswersCountByDilemmaName(name);
  }

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
