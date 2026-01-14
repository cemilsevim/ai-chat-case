import { z } from 'zod';

export const ChatCompletionRequestSchema = z.object({
    message: z.string().min(1),
});

export type ChatCompletionRequestDto = z.infer<
    typeof ChatCompletionRequestSchema
>;
