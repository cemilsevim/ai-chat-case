import { FastifyRequest, FastifyReply } from 'fastify';
import { ICompletionStrategy } from './completion-strategy.interface';
import { ChatService } from '../chat.service';
import {
    BaseResponseDto,
    ChatCompletionRequestDto,
    ChatIdRequestDto,
} from '../../../dto';
import { FeatureFlagsService } from '../../feature-flags';
import { FEATURE_FLAG_KEYS } from '../../../configs';

export class JsonCompletionStrategy implements ICompletionStrategy {
    constructor(
        private readonly chatService: ChatService,
        private readonly featureFlagService: FeatureFlagsService,
    ) {}

    async execute(req: FastifyRequest, res: FastifyReply): Promise<void> {
        const user = req.user as FastifyRequest['user'];
        const userId = user?.id as string;
        const chatId = (req.params as ChatIdRequestDto).chatId;
        const chatCompletionRequestDto = req.body as ChatCompletionRequestDto;

        const aiToolsEnabled = await this.featureFlagService.getBoolean(
            FEATURE_FLAG_KEYS.AI_TOOLS_ENABLED,
            false,
        );
        const assistanMessage = await this.chatService.completion(
            chatCompletionRequestDto,
            chatId,
            userId,
            aiToolsEnabled,
        );

        res.send(
            new BaseResponseDto(false, {
                role: 'assistant',
                content: assistanMessage,
            }),
        );
    }
}
