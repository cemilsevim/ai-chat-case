import { FastifyReply, FastifyRequest } from 'fastify';
import { ChatService } from '../services/chat/chat.service';
import { CompletionStrategyFactory } from '../services/chat';
import { FeatureFlagsService } from '../services';
import { FEATURE_FLAG_KEYS } from '../configs';
import {
    BaseResponseDto,
    ChatCompletionRequestDto,
    ChatIdRequestDto,
} from '../dto';

export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly completionStrategyFactory: CompletionStrategyFactory,
        private readonly featureFlagService: FeatureFlagsService,
    ) {}

    async getChatLists(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as FastifyRequest['user'];
        const userId = user?.id as string;

        const paginationLimit = await this.featureFlagService.getNumber(
            FEATURE_FLAG_KEYS.PAGINATION_LIMIT,
            20,
        );
        const { items, limit } = await this.chatService.getChatList(
            userId,
            paginationLimit,
        );

        return reply.send(
            new BaseResponseDto(false, {
                chats: items,
                limit,
                count: items.length,
            }),
        );
    }

    async getChatHistory(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as FastifyRequest['user'];
        const userId = user?.id as string;
        const { chatId } = request.params as ChatIdRequestDto;

        const chatHistoryEnabled = await this.featureFlagService.getBoolean(
            FEATURE_FLAG_KEYS.CHAT_HISTORY_ENABLED,
            true,
        );
        const history = await this.chatService.getChatHistory(
            chatId,
            userId,
            chatHistoryEnabled,
        );

        return reply.send(
            new BaseResponseDto(false, {
                chat: history.chat,
                messages: history.messages,
            }),
        );
    }

    async chatCompletion(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as FastifyRequest['user'];
        const userId = user?.id as string;
        const chatId = (request.params as ChatIdRequestDto).chatId;

        const streamingEnabled = await this.featureFlagService.getBoolean(
            FEATURE_FLAG_KEYS.STREAMING_ENABLED,
            false,
        );

        const completionStrategy = this.completionStrategyFactory.create(
            streamingEnabled,
            request,
            reply,
        );
        this.chatService.setStrategy(completionStrategy);

        await this.chatService.completion(
            request.body as ChatCompletionRequestDto,
            chatId,
            userId,
        );
    }
}
