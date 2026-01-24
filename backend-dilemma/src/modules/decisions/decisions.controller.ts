import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { UserUuid } from '../../common/decorators/user-uuid.decorator';
import { UuidValidationGuard } from '../../common/guards/uuid-validation.guard';
import { DecisionsService } from './decisions.service';
import { DecisionResponseDto } from './dto/decision-response.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { FinalChoiceDto } from './dto/final-choice.dto';
import { InitialChoiceDto } from './dto/initial-choice.dto';
import { Choice } from './entities/user-decision.entity';

@ApiTags('decisions')
@Controller('decisions')
@UseGuards(UuidValidationGuard)
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Post('initial')
  @ApiOperation({ summary: 'Make initial choice' })
  @ApiHeader({
    name: 'X-User-UUID',
    required: true,
    description: 'User UUID',
  })
  @ApiHeader({
    name: 'Accept-Language',
    required: false,
    description: 'Language preference (he, en, ru)',
  })
  @ApiResponse({
    status: 201,
    description: 'Initial choice created',
    type: FeedbackResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Dilemma not found' })
  @ApiResponse({ status: 409, description: 'User already participated' })
  @HttpCode(HttpStatus.CREATED)
  async createInitialChoice(
    @UserUuid() clientUuid: string,
    @Body() dto: InitialChoiceDto,
    @I18nLang() lang?: string,
  ): Promise<FeedbackResponseDto> {
    return this.decisionsService.createInitialChoice(
      clientUuid,
      dto.dilemmaName,
      dto.choice as Choice,
      lang,
    );
  }

  @Post('final')
  @ApiOperation({ summary: 'Make final choice' })
  @ApiHeader({
    name: 'X-User-UUID',
    required: true,
    description: 'User UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Final choice updated',
    type: DecisionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'No initial choice or validation error' })
  @ApiResponse({ status: 404, description: 'Dilemma or decision not found' })
  @ApiResponse({ status: 409, description: 'Final choice already set' })
  @HttpCode(HttpStatus.OK)
  async createFinalChoice(
    @UserUuid() clientUuid: string,
    @Body() dto: FinalChoiceDto,
  ): Promise<DecisionResponseDto> {
    return this.decisionsService.createFinalChoice(
      clientUuid,
      dto.dilemmaName,
      dto.choice as Choice,
    );
  }
}
