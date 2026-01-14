import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export interface IFastifyRoute {
    setupRoutes(fastify: FastifyInstance, options: FastifyPluginOptions): void;
}
