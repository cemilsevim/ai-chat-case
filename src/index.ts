import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';

import { FastifyServer } from './fastify.server';
import { LoggerService, RedisClient, initializeRedis } from './infrastructure';

const logger = LoggerService.getInstance();

async function bootstrap(): Promise<void> {
    await initializeRedis();

    const app = new FastifyServer(logger);
    await app.start();
}

bootstrap().catch((error) => {
    logger.error('Unexpected error during bootstrap', error);
    process.exit(1);
});
