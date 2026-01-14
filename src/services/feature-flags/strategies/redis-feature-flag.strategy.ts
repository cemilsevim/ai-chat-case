import Redis from 'ioredis';
import { IFeatureFlagStrategy } from './feature-flag.interface';
import { getRedisClient } from '../../../infrastructure/redis';
import {
    FEATURE_FLAG_KEYS,
    FeatureFlagKey,
    getFeatureFlagConfig,
} from '../../../configs';

type FeatureFlagSeed = {
    key: FeatureFlagKey;
    value: string;
};

export class RedisFeatureFlagStrategy implements IFeatureFlagStrategy {
    private readonly redisClient: Redis;
    private readonly config = getFeatureFlagConfig();

    constructor() {
        this.redisClient = getRedisClient();
    }

    async init(): Promise<void> {
        await this.seedDefaults();
    }

    async getBoolean(key: string, defaultValue = false): Promise<boolean> {
        const raw = await this.getRawValue(key);
        if (raw === null) {
            return defaultValue;
        }

        return this.isTruthy(raw);
    }

    async getString(key: string, defaultValue = ''): Promise<string> {
        const raw = await this.getRawValue(key);
        return raw ?? defaultValue;
    }

    async getNumber(key: string, defaultValue = 0): Promise<number> {
        const raw = await this.getRawValue(key);
        if (raw === null) {
            return defaultValue;
        }

        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : defaultValue;
    }

    private async seedDefaults(): Promise<void> {
        const seeds: FeatureFlagSeed[] = [
            {
                key: FEATURE_FLAG_KEYS.STREAMING_ENABLED,
                value: this.booleanToString(this.config.streamingEnabled),
            },
            {
                key: FEATURE_FLAG_KEYS.PAGINATION_LIMIT,
                value: String(this.config.paginationLimit),
            },
            {
                key: FEATURE_FLAG_KEYS.AI_TOOLS_ENABLED,
                value: this.booleanToString(this.config.aiToolsEnabled),
            },
            {
                key: FEATURE_FLAG_KEYS.CHAT_HISTORY_ENABLED,
                value: this.booleanToString(this.config.chatHistoryEnabled),
            },
        ];

        for (const seed of seeds) {
            const alreadySet = await this.redisClient.exists(seed.key);
            if (alreadySet > 0) {
                continue;
            }

            await this.redisClient.set(seed.key, seed.value);
        }
    }

    private async getRawValue(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    private isTruthy(value: string): boolean {
        return /^true|1|yes|on$/i.test(value.trim());
    }

    private booleanToString(value: boolean): string {
        return value ? 'true' : 'false';
    }
}
