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

	const configService = app.get(ConfigService);

	const corsOrigin = configService.get<string>("app.corsOrigin");

	app.enableCors({
		origin: corsOrigin?.split(COMMA) || [],
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
	});

	await app.register(helmet);

	const appConfig = {
		name: configService.get<string>("app.name")!,
		port: configService.get<number>("app.port")!,
		environment: configService.get<string>("app.environment")!,
		corsOrigin,
		throtller: {
			limit: configService.get<number>("app.throttler.limit"),
			ttl: configService.get<number>("app.throttler.ttl"),
		},
	};
	const postgresConfig = {
		host: configService.get<string>("databases.postgres.host"),
		port: configService.get<string>("databases.postgres.port"),
		username: configService.get<string>("databases.postgres.username"),
		password: configService.get<string>("databases.postgres.password"),
		database: configService.get<string>("databases.postgres.database"),
	};
	const redisConfig = {
		host: configService.get<string>("databases.redis.host"),
		port: configService.get<string>("databases.redis.port"),
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
		});
	} catch (error: any) {
		logger.error("BOOTSTRAP_APP_ERROR", {
			appConfig,
			postgresConfig,
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
