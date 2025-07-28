import { GameMasterRole } from "../../../guards/@types/roles.enum.js";

export interface GameMaster {
	id: string;
	name: string;
	roles: Array<GameMasterRole>;
	createdAt: Date;
	updatedAt: Date;
}
