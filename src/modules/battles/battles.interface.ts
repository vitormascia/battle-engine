import { Player } from "../players/players.interface.js";

export interface Battle {
	id: string;
	winner: Player | null;
	winnerId: string | null;
	loser: Player | null;
	loserId: string | null;
	turns: Array<Turn>;
	createdAt: Date;
	updatedAt: Date;
}

export interface Turn {
	id: string;
	index: number;
	battle: Battle;
	battleId: string;
	createdAt: Date;
	updatedAt: Date;
}
