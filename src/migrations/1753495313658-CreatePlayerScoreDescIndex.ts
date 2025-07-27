import {
	MigrationInterface,
	QueryRunner,
} from "typeorm";

export class CreatePlayerScoreDescIndex1753495313658 implements MigrationInterface {
	name = this.constructor.name;
	/*
		Required to use CREATE/DROP INDEX CONCURRENTLY — these operations are not
		allowed inside transactions in PostgreSQL
	*/
	transaction = false;

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE INDEX CONCURRENTLY IF NOT EXISTS "PLAYER_SCORE_DESC_INDEX"
			ON "players" ("score" DESC)
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DROP INDEX CONCURRENTLY IF EXISTS "PLAYER_SCORE_DESC_INDEX"
		`);
	}
}
