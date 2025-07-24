import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	Unique,
} from "typeorm";

import { GameMasterRole } from "../../guards/roles.enum.js";
import { AbstractEntity } from "../app/base.entity.js";
import { GameMaster } from "./game_masters.interface.js";

@Entity("game_masters")
@Unique(["name"])
export class GameMasterEntity extends AbstractEntity implements GameMaster {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({
		type: "varchar",
		length: 20,
		nullable: false,
	})
	name: string;

	@Column({
		type: "enum",
		nullable: false,
		array: true,
		enum: GameMasterRole,
		default: [GameMasterRole.Moderator],
	})
	roles: Array<GameMasterRole>;
}
