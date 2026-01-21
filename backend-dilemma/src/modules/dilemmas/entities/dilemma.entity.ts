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

  @Column({ type: 'varchar', length: 255 })
  option_a_title: string;

  @Column({ type: 'text' })
  option_a_description: string;

  @Column({ type: 'varchar', length: 255 })
  option_b_title: string;

  @Column({ type: 'text' })
  option_b_description: string;

  @Column({ type: 'text' })
  feedback_a: string;

  @Column({ type: 'text' })
  feedback_b: string;

  @Column({ type: 'boolean', default: true })
  @Index()
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => UserDecision, (decision) => decision.dilemma)
  decisions?: UserDecision[];
}
