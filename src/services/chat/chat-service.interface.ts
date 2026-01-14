import { Chat, Message } from '@prisma/client';
import { GetCurrentWeatherOutput } from './ai.tools';

export interface ChatHistoryResult {
    chat: Chat;
    messages: Message[];
}
export interface ChatListResult {
    items: Chat[];
    limit: number;
}

export interface ToolCallingResult {
    toolName: string;
    data: GetCurrentWeatherOutput | unknown;
}

export type CompletionResult = string | ToolCallingResult;
