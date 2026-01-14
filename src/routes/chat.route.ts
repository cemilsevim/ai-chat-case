import { FastifyInstance } from 'fastify';
import { IFastifyRoute } from '../interfaces';
import { ChatController } from '../controllers';
import { AuthMiddleware, zodValidate } from '../middlewares';
import { ChatCompletionRequestSchema } from '../dto';
import { CompletionStrategyFactory } from '../services/chat';
import { ChatIdRequestSchema } from '../dto/chat/chat-id-request.dto';

export class ChatRoute implements IFastifyRoute {
    constructor(
        private readonly app: FastifyInstance,
        private readonly chatController: ChatController,
        private readonly authMiddleware: AuthMiddleware,
    ) {}

    setupRoutes(fastify: FastifyInstance) {
        fastify.get(
            '/',
            {
                preHandler: [this.authMiddleware.handler()],
            },
            (request, reply) =>
                this.chatController.getChatLists(request, reply),
        );

        fastify.get(
            '/:chatId/history',
            {
                preHandler: [
                    this.authMiddleware.handler(),
                    zodValidate(ChatIdRequestSchema, 'params'),
                ],
            },
            (request, reply) =>
                this.chatController.getChatHistory(request, reply),
        );

        fastify.post(
            '/:chatId/completion',
            {
                preHandler: [
                    this.authMiddleware.handler(),
                    zodValidate(ChatCompletionRequestSchema, 'body'),
                    zodValidate(ChatIdRequestSchema, 'params'),
                ],
            },
            (request, reply) =>
                this.chatController.chatCompletion(request, reply),
        );
    }
}
