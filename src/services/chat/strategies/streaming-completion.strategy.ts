import { ICompletionStrategy } from './completion-strategy.interface';
import { ChatService } from '../chat.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ChatCompletionRequestDto, ChatIdRequestDto } from '../../../dto';
import { FeatureFlagsService } from '../../feature-flags';
import { FEATURE_FLAG_KEYS } from '../../../configs';

export class StreamingCompletionStrategy implements ICompletionStrategy {
    constructor(
        private readonly chatService: ChatService,
        private readonly featureFlagService: FeatureFlagsService,
    ) {}

    async execute(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const user = req.user as FastifyRequest['user'];
        const userId = user?.id as string;
        const chatId = (req.params as ChatIdRequestDto).chatId;
        const chatCompletionRequestDto = req.body as ChatCompletionRequestDto;

        reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
        reply.raw.setHeader('Connection', 'keep-alive');
        reply.raw.setHeader('X-Accel-Buffering', 'no');

        reply.raw.flushHeaders?.();
        reply.hijack();

        try {
            const aiToolsEnabled = await this.featureFlagService.getBoolean(
                FEATURE_FLAG_KEYS.AI_TOOLS_ENABLED,
                false,
            );

            await this.chatService.streamCompletion(
                chatCompletionRequestDto,
                chatId,
                userId,
                (chunk: string) => {
                    reply.raw.write(`data: ${chunk}\n\n`);
                },
                aiToolsEnabled,
            );

            reply.raw.write(`event: end\ndata: [DONE]\n\n`);
        } catch (error) {
            reply.raw.write(`event: error\ndata: streaming_error\n\n`);
        } finally {
            reply.raw.end();
        }
    }
}
