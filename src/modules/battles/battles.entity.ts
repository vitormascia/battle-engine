import {
	Check,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	Relation,
} from "typeorm";

import { AbstractEntity } from "../app/base.entity.js";
import { PlayerEntity } from "../players/players.entity.js";
import { Battle } from "./battles.interface.js";
import { TurnEntity } from "./turns.entity.js";

@Entity("battles")
@Check(`
	"winnerId" IS NULL
	OR "loserId" IS NULL
	OR "winnerId" <> "loserId"
`)
// @Index("ptrId_createdAt_desc_btree_money_distro", { synchronize: false })
export class BattleEntity extends AbstractEntity implements Battle {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(
		() => PlayerEntity,
		(player) => player.wonBattles,
		{
			onDelete: "SET NULL",
			nullable: true,
		},
	)
	@JoinColumn({ name: "winnerId" })
	winner: Relation<PlayerEntity> | null;

	@Column({
		type: "varchar",
		nullable: true,
	})
	winnerId: string | null;

	@ManyToOne(
		() => PlayerEntity,
		(player) => player.lostBattles,
		{
			onDelete: "SET NULL",
			nullable: true,
		},
	)
	@JoinColumn({ name: "loserId" })
	loser: Relation<PlayerEntity> | null;

	@Column({
		type: "varchar",
		nullable: true,
	})
	loserId: string | null;

	@OneToMany(
		() => TurnEntity,
		(turn) => turn.battle,
	)
	turns: Relation<Array<TurnEntity>>;
}
