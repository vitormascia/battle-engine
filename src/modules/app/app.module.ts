import { BullModule } from "@nestjs/bullmq";
import {
	MiddlewareConsumer,
	Module,
	NestModule,
} from "@nestjs/common";
import {
	ConfigModule,
	ConfigService,
} from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import {
	seconds,
	ThrottlerGuard,
	ThrottlerModule,
} from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import path from "path";

import { ONE_SECOND_IN_MILLISECONDS } from "../../constants/time.constants.js";
import { TelemetryInterceptor } from "../../interceptors/telemetry.interceptor.js";
import { LoggerMiddleware } from "../../middlewares/logger.middleware.js";
import { BattlesModule } from "../battles/battles.module.js";
import { GameMastersModule } from "../game_masters/game_masters.module.js";
import { HealthModule } from "../health_check/health_check.module.js";
import { PlayersModule } from "../players/players.module.js";
import { RedisModule } from "../redis/redis.module.js";
import { AppConfig } from "./@types/app.interfaces.js";
import configuration from "./app.configuration.js";

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [configuration],
			envFilePath: [
				path.join(process.cwd(), ".env"),
			],
			isGlobal: true,
		}),
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService<AppConfig, true>) => ({
				throttlers: [
					{
						limit: config.get("app.throttler.limit", { infer: true }),
						ttl: seconds(config.get("app.throttler.ttl", { infer: true })),
					},
				],
			}),
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService<AppConfig, true>) => ({
				type: "postgres",
				host: config.get("databases.postgres.host", { infer: true }),
				port: config.get("databases.postgres.port", { infer: true }),
				username: config.get("databases.postgres.username", { infer: true }),
				password: config.get("databases.postgres.password", { infer: true }),
				database: config.get("databases.postgres.database", { infer: true }),
				entities: [
					path.join(process.cwd(), "build/modules/**/*.entity.js"),
					path.join(process.cwd(), "build/modules/**/entities/*.entity.js"),
				],
				connectTimeoutMS: ONE_SECOND_IN_MILLISECONDS * 10,
				logNotifications: true,
				migrations: [
					path.join(process.cwd(), "build/migrations/**/*.js"),
				],
				migrationsRun: true,
				/*
					- Behavior: Each migration runs in its own transaction
					- Pros: Migrations can override transaction = false safely (which is needed for
					the PLAYER_SCORE_DESC_INDEX)
					- Cons: Partial changes if one migration fails (earlier ones aren’t rolled back)
				*/
				migrationsTransactionMode: "each",
				synchronize: !(config.get("app.environment", { infer: true }) === "production"),
				retryAttempts: 10,
				retryDelay: ONE_SECOND_IN_MILLISECONDS * 3,
				autoLoadEntities: false,
				logging: true,
				logger: "advanced-console",
			}),
		}),
		BullModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService<AppConfig, true>) => ({
				connection: {
					host: config.get("databases.redis.host", { infer: true }),
					port: config.get("databases.redis.port", { infer: true }),
				},
			}),
		}),
		PlayersModule,
		BattlesModule,
		GameMastersModule,
		HealthModule,
		RedisModule,
	],
	controllers: [],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: TelemetryInterceptor,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
	exports: [],
})
export class AppModule implements NestModule {
	public configure(consumer: MiddlewareConsumer): void {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes("*");
	}
}
