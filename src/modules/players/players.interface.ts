import { PlayerRole } from "../../guards/roles.enum.js";
import { Battle } from "../battles/battles.interface.js";

export interface Player {
	id: string;
	name: string;
	description: string;
	gold: number;
	silver: number;
	attack: number;
	defense: number;
	hitPoints: number;
	roles: Array<PlayerRole>;
	wonBattles: Array<Battle>;
	lostBattles: Array<Battle>;
	createdAt: Date;
	updatedAt: Date;
}
