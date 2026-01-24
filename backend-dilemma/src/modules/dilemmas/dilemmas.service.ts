import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Dilemma } from './entities/dilemma.entity';
import { DilemmaListItemDto } from './dto/dilemma-list-item.dto';
import { DilemmaDetailsDto } from './dto/dilemma-details.dto';
import { UsersService } from '../users/users.service';
import { DecisionsService } from '../decisions/decisions.service';

@Injectable()
export class DilemmasService implements OnModuleInit {
  constructor(
    @InjectRepository(Dilemma)
    private readonly dilemmaRepository: Repository<Dilemma>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => DecisionsService))
    private readonly decisionsService: DecisionsService,
    private readonly i18n: I18nService,
  ) {}

  async onModuleInit() {
    await this.seedDilemmas();
  }

  private async seedDilemmas() {
    const count = await this.dilemmaRepository.count();
    if (count > 0) {
      return; // Already seeded
    }

    const dilemmaNames = ['trolley-problem', 'privacy-vs-security', 'ai-autonomy'];

    for (const name of dilemmaNames) {
      const existing = await this.dilemmaRepository.findOne({
        where: { name },
      });
      if (!existing) {
        const dilemma = this.dilemmaRepository.create({
          name,
          title: await this.i18n.translate(`dilemmas.${name}.title`, { lang: 'he' }),
          description: await this.i18n.translate(`dilemmas.${name}.description`, { lang: 'he' }),
          option_a_title: await this.i18n.translate(`dilemmas.${name}.option_a_title`, { lang: 'he' }),
          option_a_description: await this.i18n.translate(`dilemmas.${name}.option_a_description`, { lang: 'he' }),
          option_b_title: await this.i18n.translate(`dilemmas.${name}.option_b_title`, { lang: 'he' }),
          option_b_description: await this.i18n.translate(`dilemmas.${name}.option_b_description`, { lang: 'he' }),
          feedback_a: await this.i18n.translate(`dilemmas.${name}.feedback_a`, { lang: 'he' }),
          feedback_b: await this.i18n.translate(`dilemmas.${name}.feedback_b`, { lang: 'he' }),
          is_active: true,
        });
        await this.dilemmaRepository.save(dilemma);
        console.log(`Seeded dilemma: ${name}`);
      }
    }
  }

  async findAll(lang = 'he'): Promise<DilemmaListItemDto[]> {
    const dilemmas = await this.dilemmaRepository.find({
      where: { is_active: true },
    });

    const dilemmasWithCount = await Promise.all(
      dilemmas.map(async (dilemma) => {
        const participantCount =
          await this.decisionsService.countParticipantsByDilemmaId(
            dilemma.id,
          );
        return {
          name: dilemma.name,
          title: await this.i18n.translate(`dilemmas.${dilemma.name}.title`, { lang }),
          description: await this.i18n.translate(`dilemmas.${dilemma.name}.description`, { lang }),
          participantCount,
        };
      }),
    );

    return dilemmasWithCount;
  }

  async findOneByName(
    name: string,
    clientUuid?: string,
    lang = 'he',
  ): Promise<DilemmaDetailsDto> {
    const dilemma = await this.dilemmaRepository.findOne({
      where: { name, is_active: true },
    });

    if (!dilemma) {
      throw new NotFoundException(`Dilemma with name "${name}" not found`);
    }

    let hasParticipated = false;
    if (clientUuid) {
      const user = await this.usersService.findByClientUuid(clientUuid);
      if (user) {
        hasParticipated =
          await this.decisionsService.hasUserParticipated(
            user.id,
            dilemma.id,
          );
      }
    }

    return {
      name: dilemma.name,
      title: await this.i18n.translate(`dilemmas.${name}.title`, { lang }),
      description: await this.i18n.translate(`dilemmas.${name}.description`, { lang }),
      optionA: {
        title: await this.i18n.translate(`dilemmas.${name}.option_a_title`, { lang }),
        description: await this.i18n.translate(`dilemmas.${name}.option_a_description`, { lang }),
      },
      optionB: {
        title: await this.i18n.translate(`dilemmas.${name}.option_b_title`, { lang }),
        description: await this.i18n.translate(`dilemmas.${name}.option_b_description`, { lang }),
      },
      hasParticipated,
    };
  }

  async findById(id: number): Promise<Dilemma | null> {
    return this.dilemmaRepository.findOne({ where: { id } });
  }

  async findEntityByName(name: string): Promise<Dilemma | null> {
    return this.dilemmaRepository.findOne({ where: { name, is_active: true } });
  }

  async findEntityById(id: number): Promise<Dilemma | null> {
    return this.dilemmaRepository.findOne({ where: { id } });
  }
}
