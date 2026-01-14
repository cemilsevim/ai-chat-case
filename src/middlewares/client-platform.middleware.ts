import { FastifyInstance, FastifyRequest } from 'fastify';
import UAParser, { IResult as UAResult } from 'ua-parser-js';
import { FastifyMiddleware } from './base.middleware';
import { PlatformResolution, ClientPlatform } from '../types';

const BOT_REGEX = /bot|crawler|spider|crawling|headless|curl|wget|httpclient/i;
const DESKTOP_APP_REGEX = /Electron|Tauri|NW\.js|DesktopApp|MacApp|WindowsApp/i;

export class ClientPlatformMiddleware extends FastifyMiddleware {
    register(app: FastifyInstance): void {
        app.addHook('onRequest', this.bind(this.attachClientPlatform));
    }

    private async attachClientPlatform(request: FastifyRequest): Promise<void> {
        const userAgent = request.headers['user-agent'];
        const { platform, meta } = this.resolvePlatform(userAgent);

        request.clientPlatform = platform;
        request.clientPlatformMeta = meta;
    }

    private resolvePlatform(userAgent?: string): PlatformResolution {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();
        const platform = this.mapPlatform(result, userAgent);

        return {
            platform,
            meta: {
                userAgent,
                browser: result.browser,
                engine: result.engine,
                os: result.os,
                device: result.device,
                cpu: result.cpu,
                isBot: userAgent ? BOT_REGEX.test(userAgent) : false,
            },
        };
    }

    private mapPlatform(result: UAResult, userAgent?: string): ClientPlatform {
        if (userAgent && DESKTOP_APP_REGEX.test(userAgent)) {
            return 'desktop';
        }

        const deviceType = result.device.type?.toLowerCase();

        if (
            deviceType === 'mobile' ||
            deviceType === 'tablet' ||
            deviceType === 'wearable'
        ) {
            return 'mobile';
        }

        if (deviceType === 'console' || deviceType === 'smarttv') {
            return 'desktop';
        }

        return 'web';
    }
}
