import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthorsTable1778716229146 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "authors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "full_name" character varying NOT NULL,
        "date_of_birth" TIMESTAMP NOT NULL,
        "date_of_death" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "pk_authors_id" PRIMARY KEY ("id")
      )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "authors"`);
    }

}
