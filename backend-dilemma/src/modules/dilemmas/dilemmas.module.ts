import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DilemmasService } from './dilemmas.service';
import { DilemmasController } from './dilemmas.controller';
import { Dilemma } from './entities/dilemma.entity';
import { DilemmaOption } from './entities/dilemma-option.entity';
import { UsersModule } from '../users/users.module';
import { DecisionsModule } from '../decisions/decisions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dilemma, DilemmaOption]),
    UsersModule,
    forwardRef(() => DecisionsModule),
  ],
  controllers: [DilemmasController],
  providers: [DilemmasService],
  exports: [DilemmasService],
})
export class DilemmasModule {}
