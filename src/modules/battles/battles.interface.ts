import { Player } from "../players/players.type.js";

export interface TurnLog {
	lorem: string
}

export interface BattleJobData {
	traceId: string;
	challengerId: string;
	opponentId: string;
}

export interface BattleResult {
	winner: Player;
	loser: Player;
}
