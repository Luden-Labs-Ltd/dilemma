import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody } from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { UuidValidationGuard } from '../../common/guards/uuid-validation.guard';
import { UserUuid } from '../../common/decorators/user-uuid.decorator';
import { FeedbackService } from './feedback.service';
import { FeedbackRequestDto } from './dto/feedback-request.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';

@ApiTags('feedback')
@Controller('feedback')
@UseGuards(UuidValidationGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get AI feedback on dilemma choice',
    description:
      'Sends user\'s dilemma choice and reasoning to AI assistant and returns array of counter-arguments explaining why the choice might be wrong. Reasoning is optional. Supports enhanced context by accepting dilemmaText (user\'s language) and dilemmaTextOriginal (English original) for improved AI analysis.',
  })
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
  @ApiBody({
    type: FeedbackRequestDto,
    examples: {
      withTranslations: {
        summary: 'Request with translations (enhanced context)',
        value: {
          dilemmaName: 'trolley-problem',
          choice: 'A',
          reasoning: 'אני חושב שצריך להקשיב למכונה',
          dilemmaText: {
            title: 'שקיפות או יציבות',
            subtitle: 'דילמה צבאית',
            questionText: 'מה הפקודה שלך?',
            description: 'אתה מפקד ב-8200',
            reflectionText: 'נקודה למחשבה',
            options: {
              a: 'אימוץ המלצת המכונה',
              b: 'פרסום אזהרה',
            },
          },
          dilemmaTextOriginal: {
            title: 'Strategic Silence',
            subtitle: 'Military Dilemma',
            questionText: 'What is your command?',
            description: 'You are a commander in Unit 8200',
            reflectionText: 'Point to consider',
            options: {
              a: 'ADOPT MACHINE RECOMMENDATION',
              b: 'BROADCAST ALERT',
            },
          },
        },
      },
      withReasoning: {
        summary: 'Request with reasoning (backward compatible)',
        value: {
          dilemmaName: 'medical',
          choice: 'A',
          reasoning: 'אני חושב שצריך לתת עדיפות למשפחה ולהשפעה החברתית',
        },
      },
      withoutReasoning: {
        summary: 'Request without reasoning (backward compatible)',
        value: {
          dilemmaName: 'professional',
          choice: 'B',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully received AI feedback. Returns array of counter-arguments explaining why the choice might be wrong.',
    type: FeedbackResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Dilemma not found or inactive',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'OpenAI API error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Failed to get AI feedback. Please try again later.' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Request timeout',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 504 },
        message: { type: 'string', example: 'AI service did not respond in time. Please try again.' },
        error: { type: 'string', example: 'Gateway Timeout' },
      },
    },
  })
  async analyze(
    @UserUuid() clientUuid: string,
    @Body() dto: FeedbackRequestDto,
    @I18nLang() lang?: string,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.getFeedback(dto, lang);
  }
}
