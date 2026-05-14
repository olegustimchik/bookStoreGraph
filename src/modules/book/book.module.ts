import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookRepository } from './book.repository';
import { BookResolver } from './book.resolver';
import { BookService } from './book.service';
import { Book } from './entities/book.entity';
import { AuthorModule } from '../author/author.module';
import { GenreModule } from '../genre/genre.module';
import { RateLimiterModule } from '../rate-limiting/rate-limiter.module';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), GenreModule, AuthorModule, RateLimiterModule],
  providers: [BookResolver, BookService, BookRepository],
  exports: [BookService, BookRepository]
})
export class BookModule {}
