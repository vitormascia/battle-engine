import {
	MigrationInterface,
	QueryRunner,
} from "typeorm";

export class CreateMockPlayers1753495313656 implements MigrationInterface {
	name = this.constructor.name;

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			INSERT INTO public.players (
				"createdAt",
				"updatedAt",
				id,
				"name",
				description,
				gold,
				silver,
				attack,
				defense,
				"hitPoints",
				score,
				roles
			)
			VALUES
			(
				now(),
				now(),
				'4a3da18a-4552-4566-bc54-7e0c44e08adb',
				'Dummy',
				'Thinks critical hits come from constructive feedback',
				100,
				1000,
				500,
				800,
				6000,
				0,
				'{Player}'::players_roles_enum[]
			),
			(
				now(),
				now(),
				'1359adb7-9647-41a2-a3da-e19b7113d588',
				'Dummier',
				'Once tried to block a fireball with a wooden shield',
				100,
				1000,
				800,
				500,
				4000,
				0,
				'{Player}'::players_roles_enum[]
			);
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DELETE FROM public.players
			WHERE id IN (
				'4a3da18a-4552-4566-bc54-7e0c44e08adb',
				'1359adb7-9647-41a2-a3da-e19b7113d588'
			);
		`);
	}
}
