import {
	DEFAULT_APP_PORT,
	DEFAULT_BATTLE_LOCK_TTL,
	DEFAULT_CORS_ORIGIN,
	DEFAULT_POSTGRES_PORT,
	DEFAULT_REDIS_PORT,
	DEFAULT_THROTTLER_LIMIT,
	DEFAULT_THROTTLER_TTL,
} from "../../constants/app.constants.js";
import { EMPTY_STRING } from "../../constants/symbols.constants.js";

const setConfig = (value?: string, defaultValue: string = EMPTY_STRING): string => {
	return value ? value : defaultValue;
};

const configuration = (): Record<string, any> => {
	return {
		app: {
			port: parseInt(setConfig(process.env.APP_PORT, DEFAULT_APP_PORT)),
			name: setConfig(process.env.APP_NAME),
			environment: setConfig(process.env.NODE_ENV),
			corsOrigin: setConfig(process.env.CORS_ORIGIN, DEFAULT_CORS_ORIGIN),
			throttler: {
				limit: parseInt(setConfig(process.env.THROTTLER_LIMIT, DEFAULT_THROTTLER_LIMIT)),
				ttl: parseInt(setConfig(process.env.THROTTLER_TTL, DEFAULT_THROTTLER_TTL)),
			},
		},
		databases: {
			postgres: {
				host: setConfig(process.env.POSTGRES_HOST),
				port: parseInt(setConfig(process.env.POSTGRES_PORT, DEFAULT_POSTGRES_PORT)),
				username: setConfig(process.env.POSTGRES_USERNAME),
				password: setConfig(process.env.POSTGRES_PASSWORD),
				database: setConfig(process.env.POSTGRES_DATABASE),
			},
			redis: {
				host: setConfig(process.env.REDIS_HOST),
				port: parseInt(setConfig(process.env.REDIS_PORT, DEFAULT_REDIS_PORT)),
				ttls: {
					battleLock: parseInt(setConfig(process.env.BATTLE_LOCK_TTL, DEFAULT_BATTLE_LOCK_TTL)),
				},
			},
		},
	};
};

export default configuration;
