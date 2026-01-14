import { FastifyInstance } from 'fastify';
import { IFastifyRoute } from '../interfaces';

export type RouteConstructor = new (...params: any) => IFastifyRoute;
