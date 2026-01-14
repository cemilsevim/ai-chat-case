import 'fastify';
import type {
    ClientPlatform,
    ClientPlatformMeta,
} from '../middlewares/client-platform.middleware';

declare module 'fastify' {
    interface FastifyRequest {
        clientPlatform: ClientPlatform;
        clientPlatformMeta: ClientPlatformMeta;
        user?: {
            id: string;
            email: string;
            name: string;
        };
    }
}
