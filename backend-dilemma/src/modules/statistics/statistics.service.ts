import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DilemmasService } from '../dilemmas/dilemmas.service';
import { DecisionsService } from '../decisions/decisions.service';
import { UserDecision } from '../decisions/entities/user-decision.entity';
import { PathStatsDto } from './dto/path-stats.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(UserDecision)
    private readonly decisionRepository: Repository<UserDecision>,
    private readonly dilemmasService: DilemmasService,
    private readonly decisionsService: DecisionsService,
  ) {}

  async getPathStatsByDilemmaName(dilemmaName: string): Promise<PathStatsDto> {
    const dilemma = await this.dilemmasService.findEntityByName(dilemmaName);

    if (!dilemma) {
      throw new NotFoundException(`Dilemma "${dilemmaName}" not found`);
    }

    const decisions = await this.decisionRepository.find({
      where: {
        dilemma_id: dilemma.id,
      },
    });

    const stats: PathStatsDto = {
      AA: 0,
      AB: 0,
      BA: 0,
      BB: 0,
      totalCompleted: 0,
    };

    for (const decision of decisions) {
      if (!decision.final_choice) {
        continue;
      }

      const path = `${decision.initial_choice}${decision.final_choice}` as
        | 'AA'
        | 'AB'
        | 'BA'
        | 'BB';

      if (path in stats) {
        stats[path] += 1;
      }

      stats.totalCompleted += 1;
    }

    return stats;
  }
}
