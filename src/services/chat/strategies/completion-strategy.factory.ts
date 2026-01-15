import { ICompletionStrategy } from './completion-strategy.interface';
import { JsonCompletionStrategy } from './json-completion.strategy';
import { StreamingCompletionStrategy } from './streaming-completion.strategy';
import { ChatService } from '../chat.service';
import { FeatureFlagsService } from '../../feature-flags';
import { FastifyReply, FastifyRequest } from 'fastify';

export class CompletionStrategyFactory {
    constructor(
        private readonly chatService: ChatService,
        private readonly featureFlagService: FeatureFlagsService,
    ) {}

    create(
        streamingEnabled: boolean,
        request: FastifyRequest,
        reply: FastifyReply,
    ): ICompletionStrategy {
        return streamingEnabled
            ? new StreamingCompletionStrategy(
                  this.featureFlagService,
                  request,
                  reply,
              )
            : new JsonCompletionStrategy(
                  this.featureFlagService,
                  request,
                  reply,
              );
    }
}
