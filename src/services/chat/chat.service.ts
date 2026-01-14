import { ChatCompletionRequestDto } from '../../dto';
import { ChatRepository } from '../../repositories';
import { streamText, generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ApiException, CommonExceptionCodes } from '../../infrastructure';
import { MessageService } from '../message.service';
import { Chat } from '@prisma/client';
import {
    ChatHistoryResult,
    ChatListResult,
    CompletionResult,
} from './chat-service.interface';
import {
    CHAT_HISTORY_FALLBACK_LIMIT,
    DEFAULT_PAGINATION_LIMIT,
    MAX_PAGINATION_LIMIT,
    MIN_PAGINATION_LIMIT,
} from '../../configs/feature-flag.config';
import { getCurrentWeather } from './ai.tools';

export class ChatService {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly messageService: MessageService,
    ) {}

    async completion(
        { message }: ChatCompletionRequestDto,
        chatId: string,
        userId: string,
        aiToolsEnabled: boolean = false,
    ): Promise<CompletionResult> {
        const chat = await this.createChatWithOwnershipCheck(
            message,
            chatId,
            userId,
        );

        await this.messageService.createMessage(chat.id, message, 'user');

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

        if (generatedText.toolResults?.length) {
            return {
                toolName: generatedText.toolResults[0].toolName,
                data: generatedText.toolResults[0].output,
            };
        }

        await this.messageService.createMessage(
            chat.id,
            generatedText.text,
            'assistant',
        );

        return generatedText.text;
    }

    async streamCompletion(
        { message }: ChatCompletionRequestDto,
        chatId: string,
        userId: string,
        streamCallback: (chunk: string) => void,
        aiToolsEnabled: boolean = false,
    ): Promise<CompletionResult> {
        const chat = await this.createChatWithOwnershipCheck(
            message,
            chatId,
            userId,
        );

        await this.messageService.createMessage(chat.id, message, 'user');

        const stream = await streamText({
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

        let assistanMessage: string = '';
        for await (const chunk of stream.textStream) {
            streamCallback(chunk);
            assistanMessage += chunk;
        }

        await this.messageService.createMessage(
            chat.id,
            assistanMessage,
            'assistant',
        );

        return assistanMessage;
    }

    async getChatById(chatId: string) {
        const chatById = await this.chatRepository.findById(chatId);
        if (!chatById) {
            throw new ApiException(CommonExceptionCodes.NOT_FOUND);
        }

        return chatById;
    }

    async getChatByUserId(id: string, userId: string) {
        const chat = await this.chatRepository.findOne({
            id,
            user_id: userId,
        });

        if (!chat) {
            throw new ApiException(CommonExceptionCodes.NOT_FOUND);
        }

        return chat;
    }

    async checkChatOwnership(
        chatId: string,
        userId: string,
    ): Promise<Chat | null> {
        const chat = await this.getChatById(chatId);

        if (chat.user_id !== userId) {
            throw new ApiException(CommonExceptionCodes.FORBIDDEN_RESOURCE);
        }

        return chat;
    }

    async createChatWithOwnershipCheck(
        message: string,
        chatId: string,
        userId: string,
    ): Promise<Chat> {
        let chat;

        try {
            chat = await this.checkChatOwnership(chatId, userId);
        } catch (error) {
            if (
                error instanceof ApiException &&
                error.code === CommonExceptionCodes.NOT_FOUND
            ) {
                chat = null;
            } else {
                throw error;
            }
        }

        if (!chat) {
            chat = await this.chatRepository.save({
                id: chatId,
                title: message.slice(0, 30),
                user_id: userId,
            });
        }

        return chat;
    }

    async getChatList(
        userId: string,
        paginationLimit: number,
    ): Promise<ChatListResult> {
        const limit = this.normalizePaginationLimit(paginationLimit);

        const items = await this.chatRepository.findRecentByUserId(
            userId,
            limit,
        );

        return { items, limit };
    }

    async getChatHistory(
        chatId: string,
        userId: string,
        chatHistoryEnabled: boolean,
    ): Promise<ChatHistoryResult> {
        const chat = await this.getChatByUserId(chatId, userId);

        const limited = !chatHistoryEnabled;
        const messageQueryOptions = limited
            ? {
                  limit: parseInt(CHAT_HISTORY_FALLBACK_LIMIT),
                  order: 'desc' as const,
              }
            : { order: 'desc' as const };

        const messages = await this.messageService.getMessagesByChatId(
            chat.id,
            messageQueryOptions,
        );

        return {
            chat,
            messages,
        };
    }

    private normalizePaginationLimit(limit?: number): number {
        const numericLimit =
            typeof limit === 'number' && Number.isFinite(limit)
                ? limit
                : DEFAULT_PAGINATION_LIMIT;

        const integerLimit = Math.floor(numericLimit);

        return Math.min(
            MAX_PAGINATION_LIMIT,
            Math.max(MIN_PAGINATION_LIMIT, integerLimit),
        );
    }
}
