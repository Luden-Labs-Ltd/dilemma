import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody } from '@nestjs/swagger';
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
      'Sends user\'s dilemma choice and reasoning to AI assistant and returns array of counter-arguments explaining why the choice might be wrong. Reasoning is optional.',
  })
  @ApiHeader({
    name: 'X-User-UUID',
    required: true,
    description: 'User UUID',
  })
  @ApiBody({
    type: FeedbackRequestDto,
    examples: {
      withReasoning: {
        summary: 'Request with reasoning',
        value: {
          dilemmaName: 'trolley-problem',
          choice: 'A',
          reasoning: 'Мне нужны деньги сейчас, поэтому я оставлю кошелек себе',
        },
      },
      withoutReasoning: {
        summary: 'Request without reasoning',
        value: {
          dilemmaName: 'trolley-problem',
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
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.getFeedback(dto);
  }
}
