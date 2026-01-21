import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { DilemmasModule } from './modules/dilemmas/dilemmas.module';
import { DecisionsModule } from './modules/decisions/decisions.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    UsersModule,
    DilemmasModule,
    DecisionsModule,
    StatisticsModule,
  ],
})
export class AppModule {}
