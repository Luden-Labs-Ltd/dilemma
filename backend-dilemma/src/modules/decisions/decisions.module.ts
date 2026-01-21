import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecisionsService } from './decisions.service';
import { DecisionsController } from './decisions.controller';
import { UserDecision } from './entities/user-decision.entity';
import { UsersModule } from '../users/users.module';
import { DilemmasModule } from '../dilemmas/dilemmas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDecision]),
    UsersModule,
    forwardRef(() => DilemmasModule),
  ],
  controllers: [DecisionsController],
  providers: [DecisionsService],
  exports: [DecisionsService],
})
export class DecisionsModule {}
