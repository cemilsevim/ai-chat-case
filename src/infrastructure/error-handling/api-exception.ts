import { ApiExceptionCode } from './types/api-exception-code.type';

export interface SerializedException<T = ApiExceptionCode> {
    message: string;
    code: T;
    stack?: string;
    metadata?: unknown;
}

export class ApiException<T = ApiExceptionCode> extends Error {
    public readonly code: T;
    public readonly metadata?: Record<string, any>;

    constructor(code: T, message?: string, metadata?: Record<string, any>) {
        super(message);

        this.code = code;
        this.metadata = metadata;

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON(): SerializedException<T> {
        return {
            message: this.message,
            code: this.code,
            stack: this.stack,
            metadata: this.metadata,
        };
    }
}
