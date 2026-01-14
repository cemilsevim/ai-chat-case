import { Message } from '@prisma/client';
import { MessageRepository, MessageQueryOptions } from '../repositories';
import { MessageRole } from '../types/message.type';

export class MessageService {
    constructor(private readonly messageRepository: MessageRepository) {}

    async createMessage(chatId: string, message: string, role: MessageRole) {
        return await this.messageRepository.save({
            chat_id: chatId,
            content: message,
            role,
        });
    }

    async getMessagesByChatId(
        chatId: string,
        options?: MessageQueryOptions,
    ): Promise<Message[]> {
        return await this.messageRepository.findByChatId(chatId, options);
    }
}
