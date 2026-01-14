import { z } from 'zod';

export const ChatIdRequestSchema = z.object({
    chatId: z.uuidv4(),
});

export type ChatIdRequestDto = z.infer<typeof ChatIdRequestSchema>;
