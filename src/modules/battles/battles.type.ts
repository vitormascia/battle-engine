import { Job } from "bullmq";

import { PlainProperties } from "../../helpers/types.helper.js";
import { Player } from "../players/players.type.js";
import { BattleEntity } from "./battles.entity.js";
import { BattleJobData } from "./battles.interface.js";
import { TurnEntity } from "./turns.entity.js";

export type BattleJob = Job<BattleJobData, void, string>

export type PlayerInBattle = Player & {
	originalAttack: number;
	originalDefense: number;
	originalHitPoints: number;
}

export type Battle = Pick<BattleEntity, PlainProperties<BattleEntity>>;

export type Turn = Pick<TurnEntity, PlainProperties<TurnEntity>>;
