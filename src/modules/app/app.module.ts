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
import { PlayerInterceptor } from "../../interceptors/player.interceptor.js";
import { LoggerMiddleware } from "../../middlewares/logger.middleware.js";
import { BattlesModule } from "../battles/battles.module.js";
import { GameMastersModule } from "../game_masters/game_masters.module.js";
import { HealthModule } from "../health_check/health_check.module.js";
import { PlayersModule } from "../players/players.module.js";
import configuration from "./app.configuration.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

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
			useFactory: (config: ConfigService) => ({
				throttlers: [
					{
						limit: config.get<number>("app.throttler.limit")!,
						ttl: seconds(config.get<number>("app.throttler.ttl")!),
					},
				],
			}),
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: "postgres",
				host: config.get("databases.postgres.host"),
				port: config.get<number>("databases.postgres.port"),
				username: config.get("databases.postgres.username"),
				password: config.get("databases.postgres.password"),
				database: config.get("databases.postgres.database"),
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
				migrationsTransactionMode: "all",
				synchronize: !(config.get("app.environment") === "production"),
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
			useFactory: (config: ConfigService) => ({
				connection: {
					host: config.get("databases.redis.host"),
					port: config.get<number>("databases.redis.port"),
				},
			}),
		}),
		PlayersModule,
		BattlesModule,
		GameMastersModule,
		HealthModule,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: PlayerInterceptor,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		AppService,
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
