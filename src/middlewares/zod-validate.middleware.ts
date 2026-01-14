import { ZodType } from 'zod';
import { FastifyReply, FastifyRequest } from 'fastify';
import { BaseResponseDto } from '../dto';

type ZodTarget = 'body' | 'query' | 'params';

export const zodValidate =
    <T>(schema: ZodType<T>, target: ZodTarget = 'body') =>
    async (request: FastifyRequest, reply: FastifyReply) => {
        const data =
            target === 'body'
                ? request.body
                : target === 'query'
                  ? request.query
                  : request.params;

        const result = schema.safeParse(data);

        if (!result.success) {
            return reply.status(400).send(
                new BaseResponseDto(
                    true,
                    result.error.issues.map((issue) => ({
                        path: issue.path.join('.'),
                        message: issue.message,
                        code: issue.code,
                    })),
                    'Validation error',
                    'VALIDATION_ERROR',
                ),
            );
        }

        if (target === 'body') request.body = result.data as T;
        else if (target === 'query') request.query = result.data as T;
        else request.params = result.data as T;
    };
