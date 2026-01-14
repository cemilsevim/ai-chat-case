import { CommonExceptionCodes } from './enums';
import { ApiExceptionCode } from './types';
import { StatusCodes } from 'http-status-codes';

export const HttpExceptionCodeMapping: Record<
    ApiExceptionCode,
    { code: StatusCodes; status: ApiExceptionCode; message: string | string[] }
> = {
    [CommonExceptionCodes.NOT_FOUND]: {
        code: StatusCodes.NOT_FOUND,
        status: CommonExceptionCodes.NOT_FOUND,
        message: 'Not found',
    },
    [CommonExceptionCodes.RECORD_EXISTING]: {
        code: StatusCodes.CONFLICT,
        status: CommonExceptionCodes.RECORD_EXISTING,
        message: 'Record already exists',
    },
    [CommonExceptionCodes.INTERNAL_SERVER_ERROR]: {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        status: CommonExceptionCodes.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
    },
    [CommonExceptionCodes.TRANSACTION_FAILED]: {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        status: CommonExceptionCodes.TRANSACTION_FAILED,
        message: 'Transaction failed',
    },
    [CommonExceptionCodes.UNKNOWN_ERROR]: {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        status: CommonExceptionCodes.UNKNOWN_ERROR,
        message: 'Unknown error',
    },
    [CommonExceptionCodes.VALIDATION_ERROR]: {
        code: StatusCodes.BAD_REQUEST,
        status: CommonExceptionCodes.VALIDATION_ERROR,
        message: 'Validation error',
    },
    [CommonExceptionCodes.FORBIDDEN_RESOURCE]: {
        code: StatusCodes.FORBIDDEN,
        status: CommonExceptionCodes.FORBIDDEN_RESOURCE,
        message: 'Forbidden resource',
    },
};
