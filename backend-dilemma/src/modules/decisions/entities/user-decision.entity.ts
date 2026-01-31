import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Dilemma } from '../../dilemmas/entities/dilemma.entity';

/** Single letter A–J for initial/final choice (spec 006: up to 10 options). */
export type ChoiceLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';

export const VALID_CHOICES: ChoiceLetter[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
];

/** @deprecated Use ChoiceLetter for multi-option; kept for backward compat. */
export enum Choice {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
}

@Entity('user_decisions')
@Unique(['user_id', 'dilemma_id'])
@Index(['final_choice'])
export class UserDecision {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  user_id: string;

  @Column({ type: 'int' })
  @Index()
  dilemma_id: number;

  @Column({ type: 'varchar', length: 1 })
  initial_choice: ChoiceLetter;

  @Column({ type: 'varchar', length: 1, nullable: true })
  final_choice: ChoiceLetter | null;

  @Column({ type: 'boolean', nullable: true })
  changed_mind: boolean | null;

  @CreateDateColumn()
  initial_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  final_at: Date | null;

  @Column({ type: 'integer', nullable: true })
  time_to_decide: number | null;

  @ManyToOne(() => User, (user) => user.decisions)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Dilemma, (dilemma) => dilemma.decisions)
  @JoinColumn({ name: 'dilemma_id' })
  dilemma?: Dilemma;
}
