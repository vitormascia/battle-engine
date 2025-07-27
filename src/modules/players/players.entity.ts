import {
	Check,
	Column,
	Entity,
	Index,
	OneToMany,
	PrimaryGeneratedColumn,
	Relation,
	Unique,
} from "typeorm";

import { PlayerRole } from "../../guards/roles.enum.js";
import { AbstractEntity } from "../app/base.entity.js";
import { BattleEntity } from "../battles/battles.entity.js";
import { Player } from "./players.type.js";

@Entity("players")
@Unique(["name"])
@Check(`
	"gold" >= 0
	AND "gold" <= 1000000000
	AND "silver" >= 0
	AND "silver" <= 1000000000
`)
/*
	TypeORM workaround for indexes that were created manually. Read more about it
	at https://typeorm.io/docs/advanced-topics/indices/#disabling-synchronization
*/
@Index("PLAYER_SCORE_DESC_INDEX", { synchronize: false })
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
		default: 0,
	})
	gold: number;

	@Column({
		type: "integer",
		nullable: false,
		default: 0,
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
		type: "integer",
		nullable: false,
		default: 0,
	})
	score: number;

	@Column({
		type: "enum",
		nullable: false,
		array: true,
		enum: PlayerRole,
		default: [PlayerRole.Player],
	})
	roles: Array<PlayerRole>;

	@OneToMany(() => BattleEntity, (battle) => battle.challenger)
	battlesAsChallenger: Relation<Array<BattleEntity>>;

	@OneToMany(() => BattleEntity, (battle) => battle.opponent)
	battlesAsOpponent: Relation<Array<BattleEntity>>;

	@OneToMany(() => BattleEntity, (battle) => battle.winner)
	wonBattles: Relation<Array<BattleEntity>>;

	@OneToMany(() => BattleEntity, (battle) => battle.loser)
	lostBattles: Relation<Array<BattleEntity>>;

	public get bio(): string {
		return `
			Greetings 👋🏻 I am ${this.name}

			📜 Description:
			"${this.description}"

			===========================
			💰 Resources
			===========================
			🟡 Gold: ${this.gold.toLocaleString()}
			⚪ Silver: ${this.silver.toLocaleString()}

			===========================
			⚔️ Stats
			===========================
			🗡 Attack: ${this.attack.toLocaleString()}
			🛡 Defense: ${this.defense.toLocaleString()}
			❤️ HP: ${this.hitPoints.toLocaleString()}
			🏆 Score: ${this.score.toLocaleString()}

			===========================
			🎭 Roles
			===========================
			- ${this.roles.join("\n- ")}

			===========================
			📚 Battle History
			===========================
			🧨 Battles as Challenger: ${this.battlesAsChallenger.length}
			🧱 Battles as Opponent: ${this.battlesAsOpponent.length}
			🥇 Won Battles: ${this.wonBattles.length}
			💀 Lost Battles: ${this.lostBattles.length}
		`;
	}
}
