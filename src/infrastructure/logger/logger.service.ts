import { ILoggerService } from './logger.interface';
import { createLogger, format, transports, Logger, Logform } from 'winston';

const SPLAT = Symbol.for('splat');
const LOG_FILE = process.env.LOG_FILE ?? 'application.log';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const consoleFormat = format.combine(
    format.colorize({ all: true }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf((info) => {
        const { timestamp, level, message, stack } = info;
        const meta = extractMeta(info);
        const payload = stack ?? message;
        return `${timestamp} ${level}: ${payload}${meta}`;
    }),
);

const fileFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
);

function extractMeta(info: Logform.TransformableInfo): string {
    const splat = info[SPLAT] as unknown[] | undefined;
    if (!splat || splat.length === 0) {
        return '';
    }

    const value = splat.length === 1 ? splat[0] : splat;
    return ` ${JSON.stringify(value)}`;
}

export class LoggerService implements ILoggerService {
    private static instance: LoggerService;
    private readonly logger: Logger;

    private constructor() {
        const level = IS_PRODUCTION ? 'error' : 'debug';
        const consoleLevel = IS_PRODUCTION ? 'error' : 'debug';

        this.logger = createLogger({
            level,
            exitOnError: false,
            transports: [
                new transports.Console({
                    level: consoleLevel,
                    format: consoleFormat,
                }),
                new transports.File({
                    filename: LOG_FILE,
                    level,
                    format: fileFormat,
                }),
            ],
        });
    }

    static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }

        return LoggerService.instance;
    }

    info(message: string, ...meta: unknown[]): void {
        this.logger.info(message, ...meta);
    }

    warn(message: string, ...meta: unknown[]): void {
        this.logger.warn(message, ...meta);
    }

    error(message: string, ...meta: unknown[]): void {
        this.logger.error(message, ...meta);
    }

    debug(message: string, ...meta: unknown[]): void {
        this.logger.debug(message, ...meta);
    }
}
