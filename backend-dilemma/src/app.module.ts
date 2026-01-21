import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { DilemmasModule } from './modules/dilemmas/dilemmas.module';
import { DecisionsModule } from './modules/decisions/decisions.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { User } from './modules/users/entities/user.entity';
import { Dilemma } from './modules/dilemmas/entities/dilemma.entity';
import { UserDecision } from './modules/decisions/entities/user-decision.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        synchronize: true,
        timezone: 'UTC',
        extra: { options: '-c timezone=UTC' },
        entities: [User, Dilemma, UserDecision],
      }),
    }),
    UsersModule,
    DilemmasModule,
    DecisionsModule,
    StatisticsModule,
  ],
})
export class AppModule {}
