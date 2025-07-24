import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGameMaster1753330819737 implements MigrationInterface {
	name = "CreateGameMaster1753330819737";

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
				uuid_generate_v4(),
				'StarkFuture',
				'{Moderator}'::game_masters_roles_enum[],
				now(),
				now()
			);
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DELETE FROM public.game_masters
			WHERE name = 'StarkFuture';
		`);
	}
}
