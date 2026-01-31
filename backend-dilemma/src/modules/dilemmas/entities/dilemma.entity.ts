import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { UserDecision } from '../../decisions/entities/user-decision.entity';
import { DilemmaOption } from './dilemma-option.entity';

@Entity('dilemmas')
@Index(['name'], { unique: true })
export class Dilemma {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  /** Количество вариантов (2–10); дублирует options.length для быстрого доступа */
  @Column({ type: 'smallint', default: 2 })
  options_count: number;

  @Column({ type: 'boolean', default: true })
  @Index()
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => DilemmaOption, (opt: DilemmaOption) => opt.dilemma, { cascade: true })
  options?: DilemmaOption[];

  @OneToMany(() => UserDecision, (decision: UserDecision) => decision.dilemma)
  decisions?: UserDecision[];
}
