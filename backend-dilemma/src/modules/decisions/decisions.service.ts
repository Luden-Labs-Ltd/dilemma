import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { getValidOptionLetters } from '../../common/constants';
import { UserDecision, ChoiceLetter } from './entities/user-decision.entity';
import { UsersService } from '../users/users.service';
import { DilemmasService } from '../dilemmas/dilemmas.service';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { DecisionResponseDto } from './dto/decision-response.dto';

@Injectable()
export class DecisionsService {
  constructor(
    @InjectRepository(UserDecision)
    private readonly decisionRepository: Repository<UserDecision>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => DilemmasService))
    private readonly dilemmasService: DilemmasService,
    private readonly i18n: I18nService,
  ) {}

  async createInitialChoice(
    clientUuid: string,
    dilemmaName: string,
    choice: ChoiceLetter,
    lang = 'he',
  ): Promise<FeedbackResponseDto> {
    const user = await this.usersService.findOrCreateByClientUuid(clientUuid);

    const dilemma = await this.dilemmasService.findEntityByName(dilemmaName);
    if (!dilemma) {
      throw new NotFoundException(`Dilemma "${dilemmaName}" not found`);
    }

    const optionsCount = dilemma.options_count ?? 2;
    const validLetters = getValidOptionLetters(optionsCount);
    if (!validLetters.includes(choice)) {
      throw new BadRequestException(
        `Choice "${choice}" is not valid for this dilemma (allowed: ${validLetters.join(', ')})`,
      );
    }

    const existingDecision = await this.decisionRepository.findOne({
      where: {
        user_id: user.id,
        dilemma_id: dilemma.id,
      },
    });

    if (existingDecision) {
      throw new ConflictException(
        'User has already participated in this dilemma',
      );
    }

    const decision = this.decisionRepository.create({
      user_id: user.id,
      dilemma_id: dilemma.id,
      initial_choice: choice,
    });

    const savedDecision = await this.decisionRepository.save(decision);

    const feedbackKey = `feedback_${choice.toLowerCase()}`;
    const feedback = await this.i18n.translate(`dilemmas.${dilemmaName}.${feedbackKey}`, { lang });

    return {
      decisionId: savedDecision.id,
      feedback,
    };
  }

  async createFinalChoice(
    clientUuid: string,
    dilemmaName: string,
    choice: ChoiceLetter,
  ): Promise<DecisionResponseDto> {
    const user = await this.usersService.findByClientUuid(clientUuid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const dilemma = await this.dilemmasService.findEntityByName(dilemmaName);
    if (!dilemma) {
      throw new NotFoundException(`Dilemma "${dilemmaName}" not found`);
    }

    const optionsCount = dilemma.options_count ?? 2;
    const validLetters = getValidOptionLetters(optionsCount);
    if (!validLetters.includes(choice)) {
      throw new BadRequestException(
        `Choice "${choice}" is not valid for this dilemma (allowed: ${validLetters.join(', ')})`,
      );
    }

    const decision = await this.decisionRepository.findOne({
      where: {
        user_id: user.id,
        dilemma_id: dilemma.id,
      },
    });

    if (!decision) {
      throw new BadRequestException(
        'Initial choice must be made before final choice',
      );
    }

    if (decision.final_choice !== null) {
      throw new ConflictException('Final choice has already been made');
    }

    decision.final_choice = choice;
    decision.changed_mind = decision.initial_choice !== choice;
    decision.final_at = new Date();
    decision.time_to_decide = Math.floor(
      (decision.final_at.getTime() - decision.initial_at.getTime()) / 1000,
    );

    const updatedDecision = await this.decisionRepository.save(decision);

    const path = `${decision.initial_choice}${choice}`;

    return {
      decisionId: updatedDecision.id,
      initialChoice: decision.initial_choice,
      finalChoice: choice,
      changedMind: decision.changed_mind!,
      path,
      timeToDecide: decision.time_to_decide!,
    };
  }

  async hasUserParticipated(
    userId: string,
    dilemmaId: number,
  ): Promise<boolean> {
    const decision = await this.decisionRepository.findOne({
      where: {
        user_id: userId,
        dilemma_id: dilemmaId,
      },
    });
    return !!decision;
  }

  async countParticipantsByDilemmaId(dilemmaId: number): Promise<number> {
    return this.decisionRepository
      .createQueryBuilder('decision')
      .where('decision.dilemma_id = :dilemmaId', { dilemmaId })
      .andWhere('decision.final_choice IS NOT NULL')
      .getCount();
  }

  /** FR-010: true if at least one user decision exists for this dilemma. */
  async hasAnyDecisionForDilemma(dilemmaId: number): Promise<boolean> {
    const count = await this.decisionRepository.count({
      where: { dilemma_id: dilemmaId },
    });
    return count > 0;
  }

  async findMyDecisions(clientUuid: string): Promise<
    Array<{
      dilemmaName: string;
      initialChoice: string;
      finalChoice: string | null;
      path: string | null;
      changedMind?: boolean;
      timeToDecide?: number;
    }>
  > {
    const user = await this.usersService.findByClientUuid(clientUuid);
    if (!user) {
      return [];
    }

    const decisions = await this.decisionRepository.find({
      where: { user_id: user.id },
      relations: ['dilemma'],
      order: { initial_at: 'DESC' },
    });

    return decisions.map((d: UserDecision) => ({
      dilemmaName: d.dilemma?.name ?? '',
      initialChoice: d.initial_choice,
      finalChoice: d.final_choice,
      path: d.final_choice ? `${d.initial_choice}${d.final_choice}` : null,
      changedMind: d.changed_mind ?? undefined,
      timeToDecide: d.time_to_decide ?? undefined,
    }));
  }
}
