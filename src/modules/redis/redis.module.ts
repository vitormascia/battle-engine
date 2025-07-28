import {
	Logger,
	Module,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

import { AppConfig } from "../app/@types/app.interfaces.js";

@Module({
	imports: [],
	controllers: [],
	providers: [
		{
			provide: "REDIS_CLIENT",
			inject: [ConfigService],
			useFactory: (config: ConfigService<AppConfig, true>): Redis => {
				const logger = new Logger("RedisClient");

				const redis = new Redis({
					host: config.get("databases.redis.host", { infer: true }),
					port: config.get("databases.redis.port", { infer: true }),
					lazyConnect: true,
				});

				redis.on("error", (error: Error): void => {
					logger.error("REDIS_ERROR", {
						message: error.message,
						stack: error.stack,
					});
				});

				return redis;
			},
		},
	],
	exports: ["REDIS_CLIENT"],
})
export class RedisModule { }
