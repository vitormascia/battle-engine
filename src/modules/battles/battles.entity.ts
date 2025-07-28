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
import { BattleSnapshot } from "./@types/battles.interface.js";
import { Battle } from "./@types/battles.type.js";
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
		"battleSnapshot" IS NULL
		OR (
			("battleSnapshot"->>'goldLoot')::int >= 0
			AND ("battleSnapshot"->>'goldLoot')::int <= 1000000000
			AND ("battleSnapshot"->>'silverLoot')::int >= 0
			AND ("battleSnapshot"->>'silverLoot')::int <= 1000000000
		)
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
		type: "jsonb",
		nullable: true,
		default: null,
	})
	battleSnapshot: BattleSnapshot | null;

	@OneToMany(
		() => TurnEntity,
		(turn) => turn.battle,
	)
	turns: Relation<Array<TurnEntity>>;
}
