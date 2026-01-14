import { Chat } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ChatRepository extends BaseRepository<Chat> {
    protected override get model() {
        return this.prisma.chat;
    }

    async findRecentByUserId(userId: string, limit: number): Promise<Chat[]> {
        return await this.model.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: limit,
        });
    }
}
