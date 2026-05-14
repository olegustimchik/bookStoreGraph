import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBooksTable1778716367659 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "books" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL UNIQUE,
                "publication_date" TIMESTAMP NOT NULL,
                "author_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "pk_books_id" PRIMARY KEY ("id"),
                CONSTRAINT "books_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`);
        await queryRunner.query(`
            CREATE TABLE "books_genres_genres" (
                "books_id" uuid NOT NULL,
                "genres_id" uuid NOT NULL,
                CONSTRAINT "pk_books_genres_id" PRIMARY KEY ("books_id", "genres_id"),
                CONSTRAINT "books_genres_books_id_fkey" FOREIGN KEY ("books_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "books_genres_genres_id_fkey" FOREIGN KEY ("genres_id") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> { 
        await queryRunner.query(`DROP TABLE "books_genres_genres"`); 
        await queryRunner.query(`DROP TABLE "books"`); 
    }

}
