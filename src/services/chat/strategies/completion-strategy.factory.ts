import { ICompletionStrategy } from './completion-strategy.interface';
import { JsonCompletionStrategy } from './json-completion.strategy';
import { StreamingCompletionStrategy } from './streaming-completion.strategy';
import { ChatService } from '../chat.service';
import { FeatureFlagsService } from '../../feature-flags';

export class CompletionStrategyFactory {
    constructor(
        private readonly chatService: ChatService,
        private readonly featureFlagService: FeatureFlagsService,
    ) {}

    create(streamingEnabled: boolean): ICompletionStrategy {
        return streamingEnabled
            ? new StreamingCompletionStrategy(
                  this.chatService,
                  this.featureFlagService,
              )
            : new JsonCompletionStrategy(
                  this.chatService,
                  this.featureFlagService,
              );
    }
}
