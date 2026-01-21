import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { DilemmasModule } from '../dilemmas/dilemmas.module';
import { DecisionsModule } from '../decisions/decisions.module';
import { UserDecision } from '../decisions/entities/user-decision.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDecision]),
    DilemmasModule,
    DecisionsModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
