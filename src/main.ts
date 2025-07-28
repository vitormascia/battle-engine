import helmet from "@fastify/helmet";
import {
	ConsoleLogger,
	Logger,
	ValidationPipe,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { COMMA } from "./constants/symbols.constants.js";
import { HttpExceptionFilter } from "./filters/http_exception.filter.js";
import { AppConfig } from "./modules/app/app.interfaces.js";
import { AppModule } from "./modules/app/app.module.js";
import { TrimPipe } from "./pipes/trim.pipe.js";

async function bootstrap(): Promise<void> {
	const fastifyAdapter = new FastifyAdapter({
		logger: true,
		trustProxy: true,
		maxParamLength: 200,
	});

	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		fastifyAdapter,
		{
			rawBody: true,
			logger: new ConsoleLogger({
				logLevels: ["debug", "log", "verbose", "warn", "error", "fatal"],
				prefix: "BattleEngine",
				timestamp: true,
				colors: true,
				sorted: true,
			}),
		},
	);

	app.useGlobalFilters(new HttpExceptionFilter());

	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		transform: true,
	}));
	app.useGlobalPipes(new TrimPipe());

	const configService = app.get<ConfigService<AppConfig, true>>(ConfigService);

	const corsOrigin = configService.get("app.corsOrigin", { infer: true });

	app.enableCors({
		origin: corsOrigin.split(COMMA),
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
	});

	await app.register(helmet);

	const appConfig = {
		name: configService.get("app.name", { infer: true }),
		port: configService.get("app.port", { infer: true }),
		environment: configService.get("app.environment", { infer: true }),
		corsOrigin,
		throtller: {
			limit: configService.get("app.throttler.limit", { infer: true }),
			ttl: configService.get("app.throttler.ttl", { infer: true }),
		},
	};
	const postgresConfig = {
		host: configService.get("databases.postgres.host", { infer: true }),
		port: configService.get("databases.postgres.port", { infer: true }),
		username: configService.get("databases.postgres.username", { infer: true }),
		password: configService.get("databases.postgres.password", { infer: true }),
		database: configService.get("databases.postgres.database", { infer: true }),
	};
	const redisConfig = {
		host: configService.get("databases.redis.host", { infer: true }),
		port: configService.get("databases.redis.port", { infer: true }),
		ttls: {
			battleLocks: configService.get("databases.redis.ttls.battleLock", { infer: true }),
		},
	};
	const inGame = {
		difficulty: configService.get("inGame.difficulty", { infer: true }),
	};

	const logger = new Logger();

	try {
		await app.listen(appConfig.port);

		logger.debug("RUNNING_APP", {
			app: appConfig,
			databases: {
				postgres: postgresConfig,
				redis: redisConfig,
			},
			inGame,
		});
	} catch (error: any) {
		logger.error("BOOTSTRAP_APP_ERROR", {
			appConfig,
			postgresConfig,
			redisConfig,
			inGame,
			error: {
				message: error.message,
				stack: error.stack,
			},
		});

		process.exit(1);
	}

	const gracefulShutdown = async (): Promise<void> => {
		try {
			logger.debug("SHUTTING_DOWN_SERVER");

			await app.close();

			process.exit(0);
		} catch (error: any) {
			logger.error("SHUTTING_DOWN_SERVER_ERROR", {
				error: {
					message: error.message,
					stack: error.stack,
				},
			});

			process.exit(1);
		}
	};

	/* Listen for termination signal (e.g., `kill` command) */
	process.on("SIGTERM", gracefulShutdown);
	/* Listen for interrupt signal (e.g., Ctrl+C in terminal) */
	process.on("SIGINT", gracefulShutdown);
}

void bootstrap();
