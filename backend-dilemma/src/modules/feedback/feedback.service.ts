import {
  Injectable,
  NotFoundException,
  BadRequestException,
  GatewayTimeoutException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DilemmasService } from '../dilemmas/dilemmas.service';
import { Dilemma } from '../dilemmas/entities/dilemma.entity';
import { FeedbackRequestDto } from './dto/feedback-request.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);
  private readonly openaiClient: OpenAI;
  private readonly assistantId: string;
  private readonly timeoutMs = 60000; // 60 seconds

  constructor(
    private readonly configService: ConfigService,
    private readonly dilemmasService: DilemmasService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const assistantId = this.configService.get<string>('OPENAI_ASSISTANT_ID');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }

    if (!assistantId) {
      throw new Error('OPENAI_ASSISTANT_ID is not defined in environment variables');
    }

    this.assistantId = assistantId;
    this.openaiClient = new OpenAI({
      apiKey,
    });
  }

  async getFeedback(
    request: FeedbackRequestDto,
  ): Promise<FeedbackResponseDto> {
    // Validate dilemma exists and is active
    const dilemma = await this.dilemmasService.findEntityByName(
      request.dilemmaName,
    );

    if (!dilemma) {
      throw new NotFoundException(
        `Dilemma '${request.dilemmaName}' not found or inactive`,
      );
    }

    // Build prompt
    const prompt = this.buildPrompt(dilemma, request.choice, request.reasoning);

    try {
      // Create thread
      const thread = await this.openaiClient.beta.threads.create();

      // Add message
      await this.openaiClient.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: prompt,
      });

      // Create run
      const run = await this.openaiClient.beta.threads.runs.create(thread.id, {
        assistant_id: this.assistantId,
      } as any);

      // Wait for completion with timeout
      await this.waitForCompletion(run.id, thread.id);

      // Extract response
      const rawResponse = await this.extractResponse(thread.id);

      // Parse JSON response
      const counterArguments = this.parseJsonResponse(rawResponse);

      // Validate response format
      this.validateResponseFormat(counterArguments);

      this.logger.log(
        `Successfully processed feedback request for dilemma: ${request.dilemmaName}`,
      );

      return {
        counterArguments,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      this.logger.error(
        `Error processing feedback request: ${errorMessage}`,
        errorStack,
      );

      if (error instanceof GatewayTimeoutException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      // Handle OpenAI API errors
      if (error instanceof OpenAI.APIError) {
        throw new InternalServerErrorException(
          'Failed to get AI feedback. Please try again later.',
        );
      }

      // Handle timeout errors
      if (
        (error instanceof Error && error.message?.includes('timeout')) ||
        (error instanceof Error && error.message?.includes('Timeout'))
      ) {
        throw new GatewayTimeoutException(
          'AI service did not respond in time. Please try again.',
        );
      }

      // Generic error
      throw new InternalServerErrorException(
        'Failed to get AI feedback. Please try again later.',
      );
    }
  }

  private buildPrompt(
    dilemma: Dilemma,
    choice: 'A' | 'B',
    reasoning?: string,
  ): string {
    const choiceTitle =
      choice === 'A' ? dilemma.option_a_title : dilemma.option_b_title;
    const choiceDescription =
      choice === 'A'
        ? dilemma.option_a_description
        : dilemma.option_b_description;

    let prompt = `Дилемма: ${dilemma.title}
Описание: ${dilemma.description}

Вариант A: ${dilemma.option_a_title}
${dilemma.option_a_description}

Вариант B: ${dilemma.option_b_title}
${dilemma.option_b_description}

Ответ пользователя: ${choice} (${choiceTitle})
${choiceDescription}`;

    if (reasoning && reasoning.trim().length > 0) {
      prompt += `\n\nРазмышления пользователя: ${reasoning}`;
    }

    return prompt;
  }

  private async waitForCompletion(
    runId: string,
    threadId: string,
  ): Promise<void> {
    const startTime = Date.now();
    const maxTries = 60; // 60 seconds with 1 second intervals
    let tries = 0;

    while (tries < maxTries) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= this.timeoutMs) {
        throw new GatewayTimeoutException(
          'AI service did not respond in time. Please try again.',
        );
      }

      const runStatus = await this.openaiClient.beta.threads.runs.retrieve(
        runId,
        {
          thread_id: threadId,
        },
      );

      if (runStatus.status === 'completed') {
        return;
      }

      if (
        runStatus.status === 'failed' ||
        runStatus.status === 'cancelled' ||
        runStatus.status === 'expired'
      ) {
        throw new InternalServerErrorException(
          `AI service run ${runStatus.status}. Please try again later.`,
        );
      }

      // Wait 1 second before next check
      await new Promise((resolve) => setTimeout(resolve, 1000));
      tries++;
    }

    throw new GatewayTimeoutException(
      'AI service did not respond in time. Please try again.',
    );
  }

  private async extractResponse(threadId: string): Promise<string> {
    const messages = await this.openaiClient.beta.threads.messages.list(
      threadId,
    );

    const assistantMessages = messages.data.filter(
      (m) => m.role === 'assistant',
    );

    if (!assistantMessages.length) {
      throw new InternalServerErrorException(
        'No response received from AI service.',
      );
    }

    // Get the latest assistant message
    const latestMessage = assistantMessages[0];

    if (
      Array.isArray(latestMessage.content) &&
      latestMessage.content.length > 0 &&
      latestMessage.content[0].type === 'text'
    ) {
      return latestMessage.content[0].text.value;
    }

    throw new InternalServerErrorException(
      'Invalid response format from AI service.',
    );
  }

  private parseJsonResponse(response: string): string[] {
    // Strategy 1: Try extracting JSON from markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        // Continue to next strategy
      }
    }

    // Strategy 2: Try finding JSON array directly
    const jsonArrayMatch = response.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      try {
        const parsed = JSON.parse(jsonArrayMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        // Continue to next strategy
      }
    }

    // Strategy 3: Try parsing entire response as JSON
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // All strategies failed
    }

    throw new BadRequestException(
      'Failed to parse AI response. Invalid format received.',
    );
  }

  private validateResponseFormat(counterArguments: unknown): void {
    if (!Array.isArray(counterArguments)) {
      throw new BadRequestException(
        'Invalid AI response format: expected array of strings.',
      );
    }

    for (const item of counterArguments) {
      if (typeof item !== 'string') {
        throw new BadRequestException(
          'Invalid AI response format: all items must be strings.',
        );
      }
    }
  }
}
