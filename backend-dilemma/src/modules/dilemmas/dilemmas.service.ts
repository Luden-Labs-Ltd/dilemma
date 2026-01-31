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
import { getValidOptionLetters } from '../../common/constants';
import { Dilemma } from './entities/dilemma.entity';
import { DilemmaOption } from './entities/dilemma-option.entity';
import { DilemmaListItemDto } from './dto/dilemma-list-item.dto';
import { DilemmaDetailsDto, OptionDto } from './dto/dilemma-details.dto';
import { UsersService } from '../users/users.service';
import { DecisionsService } from '../decisions/decisions.service';


@Injectable()
export class DilemmasService implements OnModuleInit {
  constructor(
    @InjectRepository(Dilemma)
    private readonly dilemmaRepository: Repository<Dilemma>,
    @InjectRepository(DilemmaOption)
    private readonly optionRepository: Repository<DilemmaOption>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => DecisionsService))
    private readonly decisionsService: DecisionsService,
    private readonly i18n: I18nService,
  ) {}

  async onModuleInit() {
    await this.seedDilemmas();
  }

  private async seedDilemmas() {
    const dilemmaNames = ['doctor', 'commander', 'teacher'] as const;

    for (const name of dilemmaNames) {
      const existing = await this.dilemmaRepository.findOne({
        where: { name },
        relations: ['options'],
      });
      if (!existing) {
        const optionsCount = name === 'teacher' ? 3 : 2;
        const letters = getValidOptionLetters(optionsCount);
        const dilemma = this.dilemmaRepository.create({
          name,
          title: await this.i18n.translate(`dilemmas.${name}.title`, { lang: 'he' }),
          description: await this.i18n.translate(`dilemmas.${name}.description`, { lang: 'he' }),
          options_count: optionsCount,
          is_active: true,
        });
        const saved = await this.dilemmaRepository.save(dilemma);
        for (const letter of letters) {
          await this.optionRepository.save(
            this.optionRepository.create({
              dilemma_id: saved.id,
              option_letter: letter,
            }),
          );
        }
        console.log(`Seeded dilemma: ${name} (options: ${letters.join(', ')})`);
      } else if (name === 'teacher' && (existing.options_count ?? 2) !== 3) {
        await this.dilemmaRepository.update(
          { name: 'teacher' },
          { options_count: 3 },
        );
        const hasC = existing.options?.some((o: DilemmaOption) => o.option_letter === 'C');
        if (!hasC) {
          const stateRow = await this.dilemmaRepository.findOne({
            where: { name: 'state' },
          });
          if (stateRow) {
            await this.optionRepository.save(
              this.optionRepository.create({
                dilemma_id: stateRow.id,
                option_letter: 'C',
              }),
            );
          }
        }
        console.log('Updated dilemma "state" to options_count = 3');
      }
    }
  }

  async findAll(lang = 'he'): Promise<DilemmaListItemDto[]> {
    const dilemmas = await this.dilemmaRepository.find({
      where: { is_active: true },
    });

    const dilemmasWithCount = await Promise.all(
      dilemmas.map(async (dilemma: Dilemma) => {
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
      relations: ['options'],
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

    const optionRows = (dilemma.options ?? []).slice().sort((a: DilemmaOption, b: DilemmaOption) => a.option_letter.localeCompare(b.option_letter));
    const options: OptionDto[] = await Promise.all(
      optionRows.map(async (opt: DilemmaOption) => {
        const key = opt.option_letter.toLowerCase();
        return {
          id: opt.option_letter,
          title: await this.i18n.translate(`dilemmas.${name}.option_${key}_title`, { lang }),
          description: await this.i18n.translate(`dilemmas.${name}.option_${key}_description`, { lang }),
        };
      }),
    );

    return {
      name: dilemma.name,
      title: await this.i18n.translate(`dilemmas.${name}.title`, { lang }),
      description: await this.i18n.translate(`dilemmas.${name}.description`, { lang }),
      options,
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

  /**
   * FR-010: Returns false if the dilemma has at least one user decision.
   * Use before updating options_count or option set (e.g. in future admin API).
   */
  async canChangeOptions(dilemmaId: number): Promise<boolean> {
    return this.decisionsService.hasAnyDecisionForDilemma(dilemmaId).then((has) => !has);
  }

  /**
   * Обновляет дилему без опций: только title, description, is_active.
   * Опции (options_count, dilemma_options) не меняются.
   */
  async updateByName(
    name: string,
    dto: { title?: string; description?: string; is_active?: boolean },
  ): Promise<Dilemma> {
    const dilemma = await this.dilemmaRepository.findOne({ where: { name } });
    if (!dilemma) {
      throw new NotFoundException(`Dilemma with name "${name}" not found`);
    }
    const payload: Partial<Dilemma> = {};
    if (dto.title !== undefined) payload.title = dto.title;
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.is_active !== undefined) payload.is_active = dto.is_active;
    if (Object.keys(payload).length === 0) return dilemma;
    await this.dilemmaRepository.update({ name }, payload);
    const updated = await this.dilemmaRepository.findOne({ where: { name } });
    return updated ?? dilemma;
  }
}
