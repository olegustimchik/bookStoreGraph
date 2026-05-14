import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Book } from './src/modules/book/entities/book.entity';
import { Author } from './src/modules/author/entities/author.entity';
import { Genre } from './src/modules/genre/entities/genre.entity';

async function bootstrap() {
  console.log("Starting seeder...");
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  if (!dataSource.isInitialized) {
      await dataSource.initialize();
  }

  console.log("Database connected. Generating data...");

  const genreRepo = dataSource.getRepository(Genre);
  const authorRepo = dataSource.getRepository(Author);
  const bookRepo = dataSource.getRepository(Book);

  // 1. Generate Genres
  const genreNames = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Horror', 'Historical', 'Biography', 'Autobiography', 'Poetry', 'Adventure'];
  const genres = [];
  for (const name of genreNames) {
      let genre = await genreRepo.findOneBy({ name });
      if (!genre) {
          genre = genreRepo.create({ name });
          await genreRepo.save(genre);
      }
      genres.push(genre);
  }

  console.log("Genres seeded.");

  // 2. Generate Authors
  const authors = [];
  for (let i = 0; i < 50; i++) {
        const author = authorRepo.create({
            fullName: faker.person.fullName(),
            dateOfBirth: faker.date.birthdate(),
            dateOfDeath: faker.helpers.maybe(() => faker.date.past({ years: 10 }), { probability: 0.3 })
        });
        authors.push(author);
  }
  await authorRepo.save(authors);
  console.log("50 Authors seeded.");

  // 3. Generate 1000 Books
  const books = [];
  for (let i = 0; i < 1000; i++) {
      const book = bookRepo.create({
          title: faker.book.title(),
          publicationDate: faker.date.past({ years: 50 }),
          author: faker.helpers.arrayElement(authors),
          genres: faker.helpers.arrayElements(genres, faker.number.int({ min: 1, max: 3 }))
      });
      books.push(book);
  }

  // Save in chunks to not overwhelm memory/connection
  const chunkSize = 100;
  for (let i = 0; i < books.length; i += chunkSize) {
      const chunk = books.slice(i, i + chunkSize);
      await bookRepo.save(chunk);
      console.log(`Saved batch of ${chunkSize} books. Progress: ${i + chunkSize} / 1000`);
  }

  console.log("Seeding complete! 🚀");
  await app.close();
}

bootstrap().catch(console.error);
