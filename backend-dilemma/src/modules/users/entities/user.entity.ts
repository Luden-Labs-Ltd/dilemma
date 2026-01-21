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

@Entity('users')
@Index(['client_uuid'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  client_uuid: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  last_active: Date;

  @OneToMany(() => UserDecision, (decision) => decision.user)
  decisions?: UserDecision[];
}
