import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Dilemma } from '../modules/dilemmas/entities/dilemma.entity';
import { UserDecision } from '../modules/decisions/entities/user-decision.entity';

export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || "",
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'dilemma_db',
  entities: [User, Dilemma, UserDecision],
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev, use migrations in prod
  logging: process.env.NODE_ENV === 'development',
  migrations: ['migrations/*.ts'],
};

export const AppDataSource = new DataSource(databaseConfig);
