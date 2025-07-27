import {
	MigrationInterface,
	QueryRunner,
} from "typeorm";

export class CreateGameMaster1753495313656 implements MigrationInterface {
	name = this.constructor.name;

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			INSERT INTO public.game_masters (
				id,
				"name",
				roles,
				"createdAt",
				"updatedAt"
			)
			VALUES (
				'cca0e416-749d-4acf-8444-c45ac9e5e43f',
				'Scopely',
				'{Moderator}'::game_masters_roles_enum[],
				now(),
				now()
			);
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DELETE FROM public.game_masters
			WHERE name = 'Scopely';
		`);
	}
}
