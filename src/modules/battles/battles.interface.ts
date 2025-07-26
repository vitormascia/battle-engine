import { Player } from "../players/players.type.js";

export interface TurnSnapshot {
	/* Start Data */
	turnIndex: number;
	initialAttacker: Player;
	initialDefender: Player;
	/* Hit or Miss Data */
	hitChance: number;
	hitChancePercentage: number;
	attackRoll: number;
	isHit: boolean;
	/* Damage Data */
	newDefenderHitPoints: number;
	defenderHitPointsReducedPercentage: number;
	attackReductionMultiplier: number;
	newDefenderAttackCandidate: number;
	halvedAttack: number;
	attackCap: number;
	newDefenderAttack: number;
	/* End Data */
	isLastTurn: boolean;
	attacker: Player;
	defender: Player;
}

export interface BattleSnapshot {
	loot: number;
	goldLoot: number;
	silverLoot: number;
	lootPercentage: number;
	winner: {
		gold: {
			before: number;
			after: number;
		},
		silver: {
			before: number;
			after: number;
		}
	},
	loser: {
		gold: {
			before: number;
			after: number;
		},
		silver: {
			before: number;
			after: number;
		}
	}
}

export interface BattleJobData {
	traceId: string;
	challengerId: string;
	opponentId: string;
}

export interface BattleOutcome {
	winner: Player;
	loser: Player;
}

export interface BattleResult extends BattleOutcome {
	turnsSnapshot: Array<TurnSnapshot>;
}

export interface LootResourcesResult {
	battleSnapshot: BattleSnapshot;
}
