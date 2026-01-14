import type { FastifyInstance } from 'fastify';

export abstract class FastifyMiddleware {
    abstract register(app: FastifyInstance): void;

    protected bind<T extends (...args: any[]) => any>(handler: T): T {
        return handler.bind(this) as T;
    }
}
