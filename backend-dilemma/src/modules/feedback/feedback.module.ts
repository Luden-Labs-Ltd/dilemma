import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DilemmasModule } from '../dilemmas/dilemmas.module';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';

@Module({
  imports: [ConfigModule, DilemmasModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
