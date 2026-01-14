import Redis from 'ioredis';
import { LoggerService } from '../logger/logger.service';
import { getRedisConfig } from '../../configs';

export class RedisClient {
    private static instance: RedisClient;
    private readonly client: Redis;
    private readonly logger = LoggerService.getInstance();

    private constructor() {
        const config = getRedisConfig();

        this.client = new Redis(config.url, {
            lazyConnect: true,
            connectTimeout: config.connectTimeoutMs,
            maxRetriesPerRequest: 1,
        });

        this.registerEventHandlers();
    }

    static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }

        return RedisClient.instance;
    }

    static async initialize(): Promise<Redis> {
        return RedisClient.getInstance().connect();
    }

    getClient(): Redis {
        return this.client;
    }

    private async connect(): Promise<Redis> {
        if (
            this.client.status === 'wait' ||
            this.client.status === 'close' ||
            this.client.status === 'end'
        ) {
            await this.client.connect();
        }

        await this.client.ping();
        return this.client;
    }

    private registerEventHandlers(): void {
        this.client.on('connect', () => {
            this.logger.info('Redis connection established');
        });

        this.client.on('reconnecting', () => {
            this.logger.warn(
                'Redis connection lost. Attempting to reconnect...',
            );
        });

        this.client.on('error', (error) => {
            this.logger.error('Redis encountered an error', error);
        });

        this.client.on('end', () => {
            this.logger.warn('Redis connection closed');
        });
    }
}

export const initializeRedis = (): Promise<Redis> => RedisClient.initialize();

export const getRedisClient = (): Redis =>
    RedisClient.getInstance().getClient();
