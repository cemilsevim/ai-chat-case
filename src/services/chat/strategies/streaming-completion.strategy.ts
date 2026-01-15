import { ICompletionStrategy } from './completion-strategy.interface';
import { FastifyRequest, FastifyReply } from 'fastify';
import { FeatureFlagsService } from '../../feature-flags';
import { FEATURE_FLAG_KEYS } from '../../../configs';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { CompletionResult } from '../chat-service.interface';

export class StreamingCompletionStrategy implements ICompletionStrategy {
    constructor(
        private readonly featureFlagService: FeatureFlagsService,
        private readonly req: FastifyRequest,
        private readonly reply: FastifyReply,
    ) {}

    async execute(message: string): Promise<CompletionResult> {
        this.reply.raw.setHeader(
            'Content-Type',
            'text/event-stream; charset=utf-8',
        );
        this.reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
        this.reply.raw.setHeader('Connection', 'keep-alive');
        this.reply.raw.setHeader('X-Accel-Buffering', 'no');

        this.reply.raw.flushHeaders?.();
        this.reply.hijack();

        let assistanMessage: string = '';

        try {
            this.reply.raw.write(
                `event: started\ndata: {"status":"started"}\n\n`,
            );

            const stream = await streamText({
                model: openai('gpt-4.1-nano'),
                messages: [
                    {
                        role: 'user',
                        content: message,
                    },
                ],
            });

            for await (const chunk of stream.textStream) {
                assistanMessage += chunk;

                this.reply.raw.write(`data: ${chunk}\n\n`);
            }

            this.reply.raw.write(`event: end\ndata: [DONE]\n\n`);
        } catch (error) {
            this.reply.raw.write(`event: error\ndata: streaming_error\n\n`);
        } finally {
            this.reply.raw.end();
        }

        return assistanMessage;
    }
}
