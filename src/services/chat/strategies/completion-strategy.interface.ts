import { CompletionResult } from '../..';

export interface ICompletionStrategy {
    execute(message: string): Promise<CompletionResult>;
}
