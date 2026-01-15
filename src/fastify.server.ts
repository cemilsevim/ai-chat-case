import fastify, { FastifyInstance } from 'fastify';
import {
    ILoggerService,
    HttpExceptionFilter,
    prisma,
    LoggerService,
} from './infrastructure';
import { ClientPlatformMiddleware, AuthMiddleware } from './middlewares';
import { ChatRoute } from './routes';
import { RouteConstructor } from './types';
import { ChatController } from './controllers';
import {
    ChatService,
    FeatureFlagsService,
    MessageService,
    RedisFeatureFlagStrategy,
    CompletionStrategyFactory,
    FirebaseRemoteConfigStrategy,
    JsonCompletionStrategy,
} from './services';
import { ChatRepository, MessageRepository } from './repositories';
import { ServiceAccount } from 'firebase-admin';

const logger = LoggerService.getInstance();

let serviceAccount: ServiceAccount;
try {
    serviceAccount = require('./../serviceAccountKey.json');
} catch (error: any) {
    logger.warn('[Firebase] serviceAccountKey.json FAILED to load', {
        error: error?.message,
        cwd: process.cwd(),
        expectedPath: './../serviceAccountKey.json',
    });
}

const DEFAULT_PORT = (process.env.PORT as any) || 3000;
const DEFAULT_HOST = '0.0.0.0';

export class FastifyServer {
    private readonly app: FastifyInstance;
    private readonly port: number;
    private readonly host: string;
    private isShuttingDown = false;

    private readonly chatController: ChatController;
    private readonly chatService: ChatService;
    private readonly completionStrategyFactory: CompletionStrategyFactory;
    private readonly featureFlagService: FeatureFlagsService;
    private readonly chatRepository: ChatRepository;
    private readonly messageService: MessageService;
    private readonly authMiddleware: AuthMiddleware;
    private readonly messageRepository: MessageRepository;

    constructor(private readonly loggerService: ILoggerService) {
        const envPort = Number(process.env.PORT);

        this.port = Number.isFinite(envPort) ? envPort : DEFAULT_PORT;
        this.host = process.env.HOST?.trim() || DEFAULT_HOST;
        this.app = fastify({ logger: true });

        this.messageRepository = new MessageRepository(prisma);
        this.authMiddleware = new AuthMiddleware();
        this.messageService = new MessageService(this.messageRepository);
        this.chatRepository = new ChatRepository(prisma);
        // this.featureFlagService = new FeatureFlagsService(
        //     new FirebaseRemoteConfigStrategy({
        //         projectId: process.env.FIREBASE_PROJECT_ID,
        //         serviceAccount,
        //     }),
        // );
        this.featureFlagService = new FeatureFlagsService(
            new RedisFeatureFlagStrategy(),
        );
        this.featureFlagService.init();

        this.chatService = new ChatService(
            this.chatRepository,
            this.messageService,
            new JsonCompletionStrategy(this.featureFlagService, null, null),
        );
        this.completionStrategyFactory = new CompletionStrategyFactory(
            this.chatService,
            this.featureFlagService,
        );

        this.chatController = new ChatController(
            this.chatService,
            this.completionStrategyFactory,
            this.featureFlagService,
        );

        this.registerMiddlewares();
        this.registerRoutes();
        this.attachSignalHandlers();
    }

    private registerMiddlewares(): void {
        new HttpExceptionFilter().register(this.app);
        new ClientPlatformMiddleware().register(this.app);
    }

    private registerRoutes(): void {
        this.app.get('/health', async () => ({
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        }));

        const routes: {
            prefix: string;
            routeClass: RouteConstructor;
            constructorParams: unknown[];
        }[] = [
            {
                prefix: '/api/chat',
                routeClass: ChatRoute,
                constructorParams: [
                    this.app,
                    this.chatController,
                    this.authMiddleware,
                ],
            },
        ];

        for (const route of routes) {
            this.app.register(
                (fastify, options) =>
                    new route.routeClass(
                        ...route.constructorParams,
                    ).setupRoutes(fastify, options),
                { prefix: route.prefix },
            );
        }
    }

    private attachSignalHandlers(): void {
        const shutdown = this.handleShutdown.bind(this);
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }

    async start(): Promise<void> {
        try {
            await this.app.listen({ port: this.port, host: this.host });
        } catch (error) {
            this.loggerService.error('Fastify failed to start', error);
            process.exit(1);
        }
    }

    private async handleShutdown(signal: NodeJS.Signals): Promise<void> {
        if (this.isShuttingDown) {
            return;
        }

        this.isShuttingDown = true;
        this.loggerService.warn(
            `Received ${signal}. Closing Fastify instance...`,
        );

        try {
            await this.app.close();
            this.loggerService.info('Fastify server closed gracefully');
            process.exit(0);
        } catch (error) {
            this.loggerService.error(
                'Fastify shutdown encountered an error',
                error,
            );
            process.exit(1);
        }
    }
}
