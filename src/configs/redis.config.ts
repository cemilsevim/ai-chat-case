export type RedisConfig = {
    url: string;
    connectTimeoutMs: number;
    keyPrefix: string;
};

const DEFAULT_CONNECT_TIMEOUT_MS = 5000;
const DEFAULT_KEY_PREFIX = '';

export const getRedisConfig = (): RedisConfig => {
    const url = process.env.REDIS_URL?.trim();

    if (!url) {
        throw new Error('REDIS_URL environment variable is required.');
    }

    const connectTimeout = Number(
        process.env.REDIS_CONNECT_TIMEOUT_MS ?? DEFAULT_CONNECT_TIMEOUT_MS,
    );
    const keyPrefix =
        process.env.REDIS_KEY_PREFIX?.trim() || DEFAULT_KEY_PREFIX;

    return {
        url,
        connectTimeoutMs: Number.isFinite(connectTimeout)
            ? connectTimeout
            : DEFAULT_CONNECT_TIMEOUT_MS,
        keyPrefix,
    };
};
