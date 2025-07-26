import { Player } from "./players.type.js";

export interface Leaderboard {
	size: number;
	players: Array<
		Pick<Player, "id" | "score"> & { rank: number }
	>
}
