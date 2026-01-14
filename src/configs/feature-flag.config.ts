export const FEATURE_FLAG_KEYS = {
    STREAMING_ENABLED: 'STREAMING_ENABLED',
    PAGINATION_LIMIT: 'PAGINATION_LIMIT',
    AI_TOOLS_ENABLED: 'AI_TOOLS_ENABLED',
    CHAT_HISTORY_ENABLED: 'CHAT_HISTORY_ENABLED',
} as const;

export type FeatureFlagKey =
    (typeof FEATURE_FLAG_KEYS)[keyof typeof FEATURE_FLAG_KEYS];

export type FeatureFlagConfig = {
    streamingEnabled: boolean;
    paginationLimit: number;
    aiToolsEnabled: boolean;
    chatHistoryEnabled: boolean;
};

const DEFAULT_STREAMING_ENABLED = true;
const DEFAULT_AI_TOOLS_ENABLED = false;
const DEFAULT_CHAT_HISTORY_ENABLED = true;

export const DEFAULT_PAGINATION_LIMIT =
    (process.env.DEFAULT_PAGINATION_LIMIT as any) || 20;
export const MIN_PAGINATION_LIMIT =
    (process.env.MIN_PAGINATION_LIMIT as any) || 10;
export const MAX_PAGINATION_LIMIT =
    (process.env.MAX_PAGINATION_LIMIT as any) || 100;
export const CHAT_HISTORY_FALLBACK_LIMIT =
    (process.env.CHAT_HISTORY_FALLBACK_LIMIT as any) || 10;

export const getFeatureFlagConfig = (): FeatureFlagConfig => {
    const streamingEnabled = parseBoolean(
        process.env[FEATURE_FLAG_KEYS.STREAMING_ENABLED],
        DEFAULT_STREAMING_ENABLED,
    );

    const paginationLimit = parsePaginationLimit(
        process.env[FEATURE_FLAG_KEYS.PAGINATION_LIMIT],
        DEFAULT_PAGINATION_LIMIT,
    );

    const aiToolsEnabled = parseBoolean(
        process.env[FEATURE_FLAG_KEYS.AI_TOOLS_ENABLED],
        DEFAULT_AI_TOOLS_ENABLED,
    );

    const chatHistoryEnabled = parseBoolean(
        process.env[FEATURE_FLAG_KEYS.CHAT_HISTORY_ENABLED],
        DEFAULT_CHAT_HISTORY_ENABLED,
    );

    return {
        streamingEnabled,
        paginationLimit,
        aiToolsEnabled,
        chatHistoryEnabled,
    };
};

const parseBoolean = (
    value: string | undefined,
    fallback: boolean,
): boolean => {
    if (!value) {
        return fallback;
    }

    return /^true|1|yes|on$/i.test(value.trim());
};

const parsePaginationLimit = (
    value: string | undefined,
    fallback: number,
): number => {
    const parsed = Number(value ?? fallback);

    if (!Number.isFinite(parsed)) {
        return fallback;
    }

    const clamped = Math.min(
        MAX_PAGINATION_LIMIT,
        Math.max(MIN_PAGINATION_LIMIT, parsed),
    );

    return Math.trunc(clamped);
};
