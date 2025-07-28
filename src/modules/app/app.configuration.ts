import { InGameDifficulty } from "../battles/@types/battles.type.js";
import { AppConfig } from "./@types/app.interfaces.js";

const configuration = (): AppConfig => {
	return {
		app: {
			port: +process.env.APP_PORT!,
			name: process.env.APP_NAME!,
			environment: process.env.NODE_ENV!,
			corsOrigin: process.env.CORS_ORIGIN!,
			throttler: {
				limit: +process.env.THROTTLER_LIMIT!,
				ttl: +process.env.THROTTLER_TTL!,
			},
		},
		databases: {
			postgres: {
				host: process.env.POSTGRES_HOST!,
				port: +process.env.POSTGRES_PORT!,
				username: process.env.POSTGRES_USERNAME!,
				password: process.env.POSTGRES_PASSWORD!,
				database: process.env.POSTGRES_DATABASE!,
			},
			redis: {
				host: process.env.REDIS_HOST!,
				port: +process.env.REDIS_PORT!,
				ttls: {
					battleLock: +process.env.BATTLE_LOCK_TTL!,
				},
			},
		},
		inGame: {
			difficulty: process.env.IN_GAME_DIFFICULTY as InGameDifficulty,
		},
	};
};

export default configuration;
