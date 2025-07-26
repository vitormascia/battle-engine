import {
	Logger,
	Module,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

@Module({
	providers: [
		{
			provide: "REDIS_CLIENT",
			inject: [ConfigService],
			useFactory: (config: ConfigService): Redis => {
				const logger = new Logger("RedisClient");

				const redis = new Redis({
					host: config.get("databases.redis.host"),
					port: config.get<number>("databases.redis.port"),
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
