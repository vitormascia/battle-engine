import BigNumber from "bignumber.js";
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
import { Battle } from "./battles.type.js";
import { TurnEntity } from "./turns.entity.js";

@Entity("battles")
@Check(`
	(
		"winnerId" IS NULL
		OR "loserId" IS NULL
		OR "winnerId" <> "loserId"
	)
	AND
	(
		"challengerId" IS NULL
		OR "opponentId" IS NULL
		OR "challengerId" <> "opponentId"
	)
	AND
	(
		"goldLoot" >= 0
		AND "goldLoot" <= 100000000
		AND "silverLoot" >= 0
		AND "silverLoot" <= 100000000
	)
`)
export class BattleEntity extends AbstractEntity implements Battle {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(
		() => PlayerEntity,
		(player) => player.battlesAsChallenger,
		{
			onDelete: "SET NULL",
			nullable: true,
		},
	)
	@JoinColumn({ name: "challengerId" })
	challenger: Relation<PlayerEntity> | null;

	@Column({
		type: "varchar",
		nullable: true,
	})
	challengerId: string | null;

	@ManyToOne(
		() => PlayerEntity,
		(player) => player.battlesAsOpponent,
		{
			onDelete: "SET NULL",
			nullable: true,
		},
	)
	@JoinColumn({ name: "opponentId" })
	opponent: Relation<PlayerEntity> | null;

	@Column({
		type: "varchar",
		nullable: true,
	})
	opponentId: string | null;

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

	@Column({
		type: "integer",
		nullable: false,
	})
	goldLoot: number;

	@Column({
		type: "integer",
		nullable: false,
	})
	silverLoot: number;

	public get loot(): number {
		return new BigNumber(this.goldLoot).plus(this.silverLoot)
			.toNumber();
	}

	@OneToMany(
		() => TurnEntity,
		(turn) => turn.battle,
	)
	turns: Relation<Array<TurnEntity>>;
}
