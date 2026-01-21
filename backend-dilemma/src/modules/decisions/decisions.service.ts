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
import { UserDecision, Choice } from './entities/user-decision.entity';
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
  ) {}

  async createInitialChoice(
    clientUuid: string,
    dilemmaName: string,
    choice: Choice,
  ): Promise<FeedbackResponseDto> {
    // Get or create user
    const user = await this.usersService.findOrCreateByClientUuid(clientUuid);

    // Get dilemma entity
    const dilemma = await this.dilemmasService.findEntityByName(dilemmaName);
    if (!dilemma) {
      throw new NotFoundException(`Dilemma "${dilemmaName}" not found`);
    }

    // Check if user already participated
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

    // Create decision
    const decision = this.decisionRepository.create({
      user_id: user.id,
      dilemma_id: dilemma.id,
      initial_choice: choice,
    });

    const savedDecision = await this.decisionRepository.save(decision);

    // Return feedback
    const feedback =
      choice === Choice.A ? dilemma.feedback_a : dilemma.feedback_b;

    return {
      decisionId: savedDecision.id,
      feedback,
    };
  }

  async createFinalChoice(
    clientUuid: string,
    dilemmaName: string,
    choice: Choice,
  ): Promise<DecisionResponseDto> {
    // Get user
    const user = await this.usersService.findByClientUuid(clientUuid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get dilemma entity
    const dilemma = await this.dilemmasService.findEntityByName(dilemmaName);
    if (!dilemma) {
      throw new NotFoundException(`Dilemma "${dilemmaName}" not found`);
    }

    // Find existing decision
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

    // Update decision
    decision.final_choice = choice;
    decision.changed_mind = decision.initial_choice !== choice;
    decision.final_at = new Date();
    decision.time_to_decide = Math.floor(
      (decision.final_at.getTime() - decision.initial_at.getTime()) / 1000,
    );

    const updatedDecision = await this.decisionRepository.save(decision);

    // Calculate path
    const path = `${decision.initial_choice}${choice}` as
      | 'AA'
      | 'AB'
      | 'BB'
      | 'BA';

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
}
