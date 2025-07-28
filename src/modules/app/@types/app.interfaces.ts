import { InGameDifficulty } from "../../battles/@types/battles.type.js";

export interface AppConfig {
	app: {
		port: number;
		name: string;
		environment: string;
		corsOrigin: string;
		throttler: {
			limit: number;
			ttl: number;
		};
	};
	databases: {
		postgres: {
			host: string;
			port: number;
			username: string;
			password: string;
			database: string;
		};
		redis: {
			host: string;
			port: number;
			ttls: {
				battleLock: number;
			};
		};
	};
	inGame: {
		difficulty: InGameDifficulty;
	};
}
