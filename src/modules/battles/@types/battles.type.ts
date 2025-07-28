import { Job } from "bullmq";

import {
	PlainProperties,
	StrictRequired,
} from "../../../helpers/types.helper.js";
import { Player } from "../../players/@types/players.type.js";
import { BattleEntity } from "../battles.entity.js";
import { TurnEntity } from "../turns.entity.js";
import { BattleJobData } from "./battles.interface.js";

export type BattleJob = Job<BattleJobData, void, string>

export type PlayerInBattle = Player & {
	initialAttack: number;
	initialHitPoints: number;
}

export type Battle = Pick<BattleEntity, PlainProperties<BattleEntity>>

export type Turn = Pick<TurnEntity, PlainProperties<TurnEntity>>

export type CreateBattle = StrictRequired<
	Pick<Battle, "challengerId" | "opponentId">
>

export type UpdateBattle = Partial<
	Pick<Battle, "winnerId" | "loserId" | "battleSnapshot">
>

export type CreateTurn = Pick<
	Turn, "index" | "battleId" | "turnSnapshot"
>

/*
	| Difficulty    | Exponent (`x`) | Curve Behavior                                            |
	| ------------- | -------------- | --------------------------------------------------------- |
	| **Very Easy** | `0.5`          | Flattens differences → even weak attacks have good chance |
	| **Easy**      | `0.8`          | Gentle advantage to stronger stat                         |
	| **Normal**    | `1.0`          | Linear, neutral balance (default)                         |
	| **Medium**    | `1.1`          | Slightly favors stronger stat more                        |
	| **Hard**      | `1.3`          | Makes defense more impactful, steeper dropoff             |
	| **Very Hard** | `1.5`          | Small stat gaps = massive hit/miss difference             |
*/
export type InGameDifficulty = "VERY_EASY" | "EASY" | "NORMAL" | "MEDIUM" | "HARD" | "VERY_HARD"
