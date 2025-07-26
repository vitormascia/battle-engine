import { MigrationInterface, QueryRunner } from "typeorm";

export class BootstrapApp1753495313655 implements MigrationInterface {
	name = "BootstrapApp1753495313655";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TYPE "public"."players_roles_enum" AS ENUM('Player', 'PremiumPlayer', 'ClanLeader')
        `);

		await queryRunner.query(`
            CREATE TABLE "players" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(20) NOT NULL,
                "description" character varying(1000) NOT NULL,
                "gold" integer NOT NULL DEFAULT '0',
                "silver" integer NOT NULL DEFAULT '0',
                "attack" integer NOT NULL,
                "defense" integer NOT NULL,
                "hitPoints" integer NOT NULL,
                "score" integer NOT NULL DEFAULT '0',
                "roles" "public"."players_roles_enum" array NOT NULL DEFAULT '{Player}',
                CONSTRAINT "UQ_1b597c8eb2fadb72240d576fd0f" UNIQUE ("name"),
                CONSTRAINT "CHK_f53ab966318827dbf489cfaaa2" CHECK (
                    "gold" >= 0 AND "gold" <= 1000000000 AND
                    "silver" >= 0 AND "silver" <= 1000000000
                ),
                CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id")
            )
        `);

		await queryRunner.query(`
            CREATE TABLE "battles" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "challengerId" uuid,
                "opponentId" uuid,
                "winnerId" uuid,
                "loserId" uuid,
                "battleSnapshot" jsonb,
                CONSTRAINT "CHK_28163f5f06545b673a6c2a42a8" CHECK (
                    (
                        "winnerId" IS NULL OR
                        "loserId" IS NULL OR
                        "winnerId" <> "loserId"
                    ) AND (
                        "challengerId" IS NULL OR
                        "opponentId" IS NULL OR
                        "challengerId" <> "opponentId"
                    ) AND (
                        "battleSnapshot" IS NULL OR (
                            ("battleSnapshot"->>'goldLoot')::int >= 0 AND
                            ("battleSnapshot"->>'goldLoot')::int <= 1000000000 AND
                            ("battleSnapshot"->>'silverLoot')::int >= 0 AND
                            ("battleSnapshot"->>'silverLoot')::int <= 1000000000
                        )
                    )
                ),
                CONSTRAINT "PK_23c1704905b19ad7f8b957ac916" PRIMARY KEY ("id")
            )
        `);

		await queryRunner.query(`
            CREATE TABLE "turns" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "index" integer NOT NULL,
                "battleId" uuid NOT NULL,
                "turnSnapshot" jsonb NOT NULL,
                CONSTRAINT "UQ_244936a57ae2a2a714ff06a188f" UNIQUE ("index", "battleId"),
                CONSTRAINT "CHK_920c3877550384c93f26bc2aa0" CHECK (
                    "index" >= 0
                ),
                CONSTRAINT "PK_66edaea493f45e3c39d7c3553ed" PRIMARY KEY ("id")
            )
        `);

		await queryRunner.query(`
            CREATE TYPE "public"."game_masters_roles_enum" AS ENUM('Moderator', 'EventManager', 'SupportAgent')
        `);

		await queryRunner.query(`
            CREATE TABLE "game_masters" (
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(20) NOT NULL,
                "roles" "public"."game_masters_roles_enum" array NOT NULL DEFAULT '{Moderator}',
                CONSTRAINT "UQ_c2bc13aa0c81fae705292f7e60d" UNIQUE ("name"),
                CONSTRAINT "PK_7b1e4ddccf90782093f2e1a73cf" PRIMARY KEY ("id")
            )
        `);

		await queryRunner.query(`
            ALTER TABLE "battles"
            ADD CONSTRAINT "FK_58c129d304f8d787e7377641b6b"
            FOREIGN KEY ("challengerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

		await queryRunner.query(`
            ALTER TABLE "battles"
            ADD CONSTRAINT "FK_84dd34db2f0c1a66b866050ca5b"
            FOREIGN KEY ("opponentId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

		await queryRunner.query(`
            ALTER TABLE "battles"
            ADD CONSTRAINT "FK_a33e161181f6da6abf0b944d951"
            FOREIGN KEY ("winnerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

		await queryRunner.query(`
            ALTER TABLE "battles"
            ADD CONSTRAINT "FK_f751456ea5f2b1aa1240fc9733c"
            FOREIGN KEY ("loserId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

		await queryRunner.query(`
            ALTER TABLE "turns"
            ADD CONSTRAINT "FK_50d865fe40221987412349c1c72"
            FOREIGN KEY ("battleId") REFERENCES "battles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE \"turns\" DROP CONSTRAINT \"FK_50d865fe40221987412349c1c72\"");
		await queryRunner.query("ALTER TABLE \"battles\" DROP CONSTRAINT \"FK_f751456ea5f2b1aa1240fc9733c\"");
		await queryRunner.query("ALTER TABLE \"battles\" DROP CONSTRAINT \"FK_a33e161181f6da6abf0b944d951\"");
		await queryRunner.query("ALTER TABLE \"battles\" DROP CONSTRAINT \"FK_84dd34db2f0c1a66b866050ca5b\"");
		await queryRunner.query("ALTER TABLE \"battles\" DROP CONSTRAINT \"FK_58c129d304f8d787e7377641b6b\"");
		await queryRunner.query("DROP TABLE \"game_masters\"");
		await queryRunner.query("DROP TYPE \"public\".\"game_masters_roles_enum\"");
		await queryRunner.query("DROP TABLE \"turns\"");
		await queryRunner.query("DROP TABLE \"battles\"");
		await queryRunner.query("DROP TABLE \"players\"");
		await queryRunner.query("DROP TYPE \"public\".\"players_roles_enum\"");
	}
}
