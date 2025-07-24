import {
	Check,
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	Relation,
	Unique,
} from "typeorm";

import { PlayerRole } from "../../guards/roles.enum.js";
import { AbstractEntity } from "../app/base.entity.js";
import { BattleEntity } from "../battles/battles.entity.js";
import { Player } from "./players.interface.js";

@Entity("players")
@Unique(["name"])
@Check(`
	"gold" >= 0
	AND "gold" <= 1000000000
	AND "silver" >= 0
	AND "silver" <= 1000000000
`)
export class PlayerEntity extends AbstractEntity implements Player {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({
		type: "varchar",
		length: 20,
		nullable: false,
	})
	name: string;

	@Column({
		type: "varchar",
		length: 1_000,
		nullable: false,
	})
	description: string;

	@Column({
		type: "integer",
		nullable: false,
	})
	gold: number;

	@Column({
		type: "integer",
		nullable: false,
	})
	silver: number;

	@Column({
		type: "integer",
		nullable: false,
	})
	attack: number;

	@Column({
		type: "integer",
		nullable: false,
	})
	defense: number;

	@Column({
		type: "integer",
		nullable: false,
	})
	hitPoints: number;

	@Column({
		type: "enum",
		nullable: false,
		array: true,
		enum: PlayerRole,
		default: [PlayerRole.Player],
	})
	roles: Array<PlayerRole>;

	@OneToMany(() => BattleEntity, (battle) => battle.winner)
	wonBattles: Relation<Array<BattleEntity>>;

	@OneToMany(() => BattleEntity, (battle) => battle.loser)
	lostBattles: Relation<Array<BattleEntity>>;
}
