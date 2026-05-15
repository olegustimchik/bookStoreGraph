import { Module } from '@nestjs/common';
import { SearchResolver } from './search.resolver';
import { SearchService } from './search.service';
import { AuthorModule } from '../author/author.module';
import { BookModule } from '../book/book.module';
import { GenreModule } from '../genre/genre.module';

@Module({
    imports: [BookModule, AuthorModule, GenreModule],
  providers: [SearchResolver, SearchService],
})
export class SearchModule {}
