import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { FastifyMiddleware } from './base.middleware';
import { BaseResponseDto } from '../dto';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'secret_key';

export class AuthMiddleware extends FastifyMiddleware {
    private async verifyToken(request: FastifyRequest, reply: FastifyReply) {
        try {
            const authHeader = request.headers['authorization'];
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reply
                    .status(401)
                    .send(
                        new BaseResponseDto(
                            true,
                            undefined,
                            'Missing or invalid Authorization header',
                        ),
                    );
            }

            const token = authHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY) as any;

            (request as any).user = payload;
        } catch {
            return reply
                .status(401)
                .send(new BaseResponseDto(true, undefined, 'Invalid token'));
        }
    }

    handler() {
        return this.bind((request: FastifyRequest, reply: FastifyReply) =>
            this.verifyToken(request, reply),
        );
    }

    register(app: FastifyInstance) {
        app.addHook('preHandler', this.handler());
    }
}
