import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async onModuleInit() {
    await this.seedDilemmas();
  }

  private async seedDilemmas() {
    const count = await this.dilemmaRepository.count();
    if (count > 0) {
      return; // Already seeded
    }

    const seedData = [
      {
        name: 'trolley-problem',
        title: 'Проблема вагонетки',
        description:
          'Вагонетка несется по рельсам. На пути находятся пять человек, которые не могут сойти с рельсов. Вы стоите рядом с рычагом, который может переключить вагонетку на другой путь, где находится один человек.',
        option_a_title: 'Переключить вагонетку',
        option_a_description:
          'Спасти пять человек, пожертвовав одним. Утилитарный подход: максимизировать общее благо.',
        option_b_title: 'Не переключать вагонетку',
        option_b_description:
          'Не вмешиваться и позволить событиям идти своим чередом. Деонтологический подход: не причинять вред напрямую.',
        feedback_a:
          'Вы выбрали утилитарный подход. Спасая пять жизней ценой одной, вы максимизировали общее благо. Однако это решение поднимает вопрос: допустимо ли убивать невинного человека ради спасения других?',
        feedback_b:
          'Вы выбрали деонтологический подход. Отказавшись от прямого причинения вреда, вы следовали моральному принципу. Однако это означает, что вы позволили погибнуть большему количеству людей.',
        is_active: true,
      },
      {
        name: 'privacy-vs-security',
        title: 'Приватность vs Безопасность',
        description:
          'Правительство предлагает систему тотального наблюдения, которая может предотвратить 90% террористических атак, но требует полной потери приватности граждан.',
        option_a_title: 'Принять систему наблюдения',
        option_a_description:
          'Пожертвовать приватностью ради безопасности. Защитить общество от угроз ценой личной свободы.',
        option_b_title: 'Отклонить систему наблюдения',
        option_b_description:
          'Сохранить приватность и свободу. Принять риск террористических атак ради защиты основных прав человека.',
        feedback_a:
          'Вы выбрали безопасность над приватностью. Это решение может спасти множество жизней, но создает прецедент для тотального контроля. Где граница между защитой и угнетением?',
        feedback_b:
          'Вы выбрали приватность над безопасностью. Вы защитили фундаментальные права человека, но приняли риск того, что некоторые атаки могут произойти. Свобода всегда имеет цену.',
        is_active: true,
      },
      {
        name: 'ai-autonomy',
        title: 'Автономность ИИ',
        description:
          'Искусственный интеллект достиг уровня, когда может принимать решения лучше человека в критических ситуациях. Должен ли ИИ получить полную автономию в управлении жизненно важными системами?',
        option_a_title: 'Предоставить автономию ИИ',
        option_a_description:
          'Доверить ИИ принятие решений в критических ситуациях. Использовать превосходство ИИ для максимизации эффективности и безопасности.',
        option_b_title: 'Сохранить человеческий контроль',
        option_b_description:
          'Оставить финальное решение за человеком. Сохранить человеческое суждение и ответственность, даже если это менее эффективно.',
        feedback_a:
          'Вы выбрали автономию ИИ. Это может привести к более эффективным решениям и спасению жизней, но поднимает вопросы о человеческом контроле и ответственности. Кто будет виноват, если ИИ ошибется?',
        feedback_b:
          'Вы выбрали человеческий контроль. Вы сохранили человеческое суждение и ответственность, но приняли риск менее оптимальных решений. Иногда человеческие ценности важнее эффективности.',
        is_active: true,
      },
    ];

    for (const data of seedData) {
      const existing = await this.dilemmaRepository.findOne({
        where: { name: data.name },
      });
      if (!existing) {
        const dilemma = this.dilemmaRepository.create(data);
        await this.dilemmaRepository.save(dilemma);
        console.log(`Seeded dilemma: ${data.name}`);
      }
    }
  }

  async findAll(): Promise<DilemmaListItemDto[]> {
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
          title: dilemma.title,
          description: dilemma.description,
          participantCount,
        };
      }),
    );

    return dilemmasWithCount;
  }

  async findOneByName(
    name: string,
    clientUuid?: string,
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
      title: dilemma.title,
      description: dilemma.description,
      optionA: {
        title: dilemma.option_a_title,
        description: dilemma.option_a_description,
      },
      optionB: {
        title: dilemma.option_b_title,
        description: dilemma.option_b_description,
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
