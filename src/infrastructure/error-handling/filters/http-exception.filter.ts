import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { HttpExceptionCodeMapping } from '../http-exception-code-mapping';
import { BaseResponseDto } from '../../../dto';
import { ApiException } from '../api-exception';
import { ILoggerService, LoggerService } from '../../logger';
import { ApiExceptionCode } from '../types';

export class HttpExceptionFilter {
    loggerService: ILoggerService;

    constructor() {
        this.loggerService = LoggerService.getInstance();
    }

    register(app: FastifyInstance) {
        app.setErrorHandler(
            (error: any, request: FastifyRequest, reply: FastifyReply) => {
                if (error instanceof ZodError) {
                    const errorResponse = new BaseResponseDto(
                        true,
                        null,
                        error.issues.map(
                            (issue) =>
                                `${issue.path.join('.')} - ${issue.message}`,
                        ),
                    );

                    return reply.status(400).send(errorResponse);
                }

                // Unknown error
                if (
                    !(error instanceof ApiException) &&
                    !(error instanceof Error)
                ) {
                    this.loggerService.error(`Unknown error!`, error?.stack);
                    return reply
                        .status(500)
                        .send(
                            new BaseResponseDto(
                                true,
                                undefined,
                                'Unknown error',
                            ),
                        );
                }

                // ApiException
                if (error instanceof ApiException) {
                    const mapped =
                        HttpExceptionCodeMapping[
                            error.code as ApiExceptionCode
                        ];

                    const errorResponse = new BaseResponseDto(
                        true,
                        undefined,
                        mapped?.message || error.message,
                        error.code,
                    );

                    return reply
                        .status(mapped?.code || 400)
                        .send(errorResponse);
                }

                // Generic Error
                const errorResponse = new BaseResponseDto(
                    true,
                    undefined,
                    process.env.NODE_ENV === 'dev'
                        ? error.message
                        : 'Unknown Error',
                );

                return reply.status(500).send(errorResponse);
            },
        );
    }
}
