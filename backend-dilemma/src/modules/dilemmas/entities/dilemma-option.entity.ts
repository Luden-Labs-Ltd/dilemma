import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Dilemma } from './dilemma.entity';

/**
 * Один вариант ответа дилемы (A, B, C, …).
 * Тексты title/description/feedback отдаются через i18n по ключам
 * dilemmas.{dilemma.name}.option_{letter}_title и т.д.
 */
@Entity('dilemma_options')
@Unique(['dilemma_id', 'option_letter'])
export class DilemmaOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dilemma_id' })
  dilemma_id: number;

  @ManyToOne(() => Dilemma, (d) => d.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dilemma_id' })
  dilemma?: Dilemma;

  /** Буква варианта: A, B, C, … J */
  @Column({ type: 'varchar', length: 1, name: 'option_letter' })
  option_letter: string;
}
