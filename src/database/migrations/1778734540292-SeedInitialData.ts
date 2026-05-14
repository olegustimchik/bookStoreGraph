import type { MigrationInterface, QueryRunner } from "typeorm";

export class SeedInitialData1778734540292 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {

        // 1. Genres
        const genres = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Horror', 'Historical', 'Biography', 'Poetry', 'Adventure'];
        
        console.log('Seeding Genres...');
        const genreIds: string[] = [];
        for (const genreName of genres) {
            await queryRunner.query(
                `INSERT INTO "genres" ("name") VALUES ($1) ON CONFLICT("name") DO NOTHING`,
                [genreName]
            );
            const res: Array<{ id: string }> = await queryRunner.query(`SELECT "id" FROM "genres" WHERE "name" = $1`, [genreName]);
            genreIds.push(res[0].id);
        }

        // 2. Authors
        console.log('Seeding 50 Authors...');
        const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Emma', 'William', 'Olivia'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        
        const authorIds: string[] = [];
        for (let i = 0; i < 50; i++) {
            const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${fName} ${lName} ${i}`; 
            
            const start = new Date(1920, 0, 1).getTime();
            const end = new Date(2000, 0, 1).getTime();
            const dob = new Date(start + Math.random() * (end - start));
            
            const result: Array<{ id: string }> = await queryRunner.query(
                `INSERT INTO "authors" ("full_name", "date_of_birth") VALUES ($1, $2) RETURNING "id"`,
                [fullName, dob.toISOString()]
            );
            authorIds.push(result[0].id);
        }

        // 3. Books
        console.log('Seeding 1000 Books...');
        const adjectives = ['The Great', 'The Last', 'Secrets of', 'A Tale of', 'Journey to', 'Return of', 'Echoes of', 'Shadows of', 'Whispers of', 'Chronicles of'];
        const nouns = ['King', 'Kingdom', 'Empire', 'Time', 'Space', 'Earth', 'Ocean', 'Mountain', 'Magic', 'Sword'];
        
        for (let i = 0; i < 1000; i++) {
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            const title = `${adj} ${noun} ${i}`; // unique titles bounded by i
            
            const pStart = new Date(2000, 0, 1).getTime();
            const pEnd = new Date().getTime();
            const pubDate = new Date(pStart + Math.random() * (pEnd - pStart));

            const authorId = authorIds[Math.floor(Math.random() * authorIds.length)];

            // Insert Book
            const bookResult = await queryRunner.query(
                `INSERT INTO "books" ("title", "publication_date", "author_id") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING "id"`,
                [title, pubDate.toISOString(), authorId]
            );
            
            if (bookResult && bookResult.length > 0) {
                const bookId = bookResult[0].id;
                
                // Link 1-3 random genres to the book
                const numGenres = Math.floor(Math.random() * 3) + 1;
                const shuffledGenres = [...genreIds].sort(() => 0.5 - Math.random());
                const selectedGenreIds = shuffledGenres.slice(0, numGenres);

                for (const gId of selectedGenreIds) {
                    await queryRunner.query(
                        `INSERT INTO "books_genres_genres" ("books_id", "genres_id") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                        [bookId, gId]
                    );
                }
            }
        }
        console.log('Seeding completed via plain raw PostgreSQL script! 🚀');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "books_genres_genres"`);
        await queryRunner.query(`DELETE FROM "books"`);
        await queryRunner.query(`DELETE FROM "authors"`);
    }
}
