import {
	Check,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	Relation,
	Unique,
} from "typeorm";

import { AbstractEntity } from "../app/base.entity.js";
/* Avoid circular dependency error */
import type { BattleEntity } from "./battles.entity.js";
import { TurnLog } from "./battles.interface.js";
import { Turn } from "./battles.type.js";

@Entity("turns")
@Unique(["index", "battleId"])
@Check(`
	"index" >= 0
`)
export class TurnEntity extends AbstractEntity implements Turn {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({
		type: "integer",
		nullable: false,
	})
	index: number;

	@ManyToOne(
		/* Avoid circular dependency error */
		"BattleEntity",
		(battle: BattleEntity) => battle.turns,
		{
			onDelete: "CASCADE",
			nullable: false,
		},
	)
	@JoinColumn({ name: "battleId" })
	battle: Relation<BattleEntity>;

	@Column({
		type: "varchar",
		nullable: false,
	})
	battleId: string;

	@Column({
		type: "jsonb",
		nullable: false,
	})
	turnLog: TurnLog;
}
