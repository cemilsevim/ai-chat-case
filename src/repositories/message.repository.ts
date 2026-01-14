import { Message } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type MessageQueryOptions = {
    limit?: number;
    order?: 'asc' | 'desc';
};

export class MessageRepository extends BaseRepository<Message> {
    protected override get model() {
        return this.prisma.message;
    }

    async findByChatId(
        chatId: string,
        options: MessageQueryOptions = {},
    ): Promise<Message[]> {
        const { limit, order = 'asc' } = options;
        const take =
            typeof limit === 'number' && limit > 0
                ? Math.floor(limit)
                : undefined;

        return await this.model.findMany({
            where: { chat_id: chatId },
            orderBy: { created_at: order },
            ...(take ? { take } : {}),
        });
    }
}
