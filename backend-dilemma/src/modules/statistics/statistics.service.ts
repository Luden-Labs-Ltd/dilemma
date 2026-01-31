import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getValidOptionLetters } from '../../common/constants';
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

    const optionsCount = dilemma.options_count ?? 2;
    const letters = getValidOptionLetters(optionsCount);
    const pathCounts: Record<string, number> = {};
    for (const i of letters) {
      for (const j of letters) {
        pathCounts[`${i}${j}`] = 0;
      }
    }

    let totalCompleted = 0;
    const optionCounts: Record<string, number> = {};
    for (const letter of letters) {
      optionCounts[letter] = 0;
    }

    for (const decision of decisions) {
      if (!decision.final_choice) {
        continue;
      }

      const path = `${decision.initial_choice}${decision.final_choice}`;
      if (path in pathCounts) {
        pathCounts[path] += 1;
      }
      if (decision.final_choice in optionCounts) {
        optionCounts[decision.final_choice] += 1;
      }
      totalCompleted += 1;
    }

    return {
      pathCounts,
      totalCompleted,
      optionCounts,
    };
  }
}
