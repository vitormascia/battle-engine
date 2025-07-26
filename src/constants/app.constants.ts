import BigNumber from "bignumber.js";

import { ONE_MINUTE_IN_SECONDS } from "./time.constants.js";

export const DEFAULT_APP_PORT = "3000";
export const DEFAULT_POSTGRES_PORT = "5432";
export const DEFAULT_REDIS_PORT = "6379";
export const DEFAULT_CORS_ORIGIN = `http://localhost:${DEFAULT_APP_PORT}`;
export const DEFAULT_THROTTLER_LIMIT = "100";
export const DEFAULT_THROTTLER_TTL = String(ONE_MINUTE_IN_SECONDS);
export const DEFAULT_BATTLE_LOCK_TTL = String(new BigNumber(ONE_MINUTE_IN_SECONDS).times(5));
export const DEFAULT_IN_GAME_DIFFICULTY = "NORMAL";
