import { FastifyReply, FastifyRequest } from 'fastify';

export interface ICompletionStrategy {
  execute(req: FastifyRequest, res: FastifyReply): Promise<void>;
}
