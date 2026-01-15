import { FastifyRequest, FastifyReply } from 'fastify';
import { ICompletionStrategy } from './completion-strategy.interface';
import { BaseResponseDto } from '../../../dto';
import { FeatureFlagsService } from '../../feature-flags';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { FEATURE_FLAG_KEYS } from '../../../configs';
import { getCurrentWeather } from '../ai.tools';
import { CompletionResult } from '../chat-service.interface';

export class JsonCompletionStrategy implements ICompletionStrategy {
    constructor(
        private readonly featureFlagService: FeatureFlagsService,
        private readonly req: FastifyRequest,
        private readonly reply: FastifyReply,
    ) {}

    async execute(message: string): Promise<CompletionResult> {
        const aiToolsEnabled = await this.featureFlagService.getBoolean(
            FEATURE_FLAG_KEYS.AI_TOOLS_ENABLED,
            false,
        );

        const generatedText = await generateText({
            model: openai('gpt-4.1-nano'),
            messages: [
                {
                    role: 'user',
                    content: message,
                },
            ],
            tools: aiToolsEnabled
                ? {
                      getCurrentWeather,
                  }
                : {},
        });

        let result: CompletionResult = generatedText.text;

        if (generatedText.toolResults?.length) {
            result = {
                toolName: generatedText.toolResults[0].toolName,
                data: generatedText.toolResults[0].output,
            };
        }

        this.reply.send(
            new BaseResponseDto(false, {
                role: 'assistant',
                content: result,
            }),
        );

        return result;
    }
}
