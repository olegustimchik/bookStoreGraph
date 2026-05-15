import { Injectable } from '@nestjs/common';
import { AuthorService } from '../author/author.service';
import { BookService } from '../book/book.service';
import { CacheService } from '../cache/cache.service';
import { GenreService } from '../genre/genre.service';
import { SearchArgs } from './dto/request/search-input.request.dto';
import { SearchResponse } from './dto/response/search.response.dto';

@Injectable()
export class SearchService {
    constructor(private readonly booksService: BookService, private readonly authorsService: AuthorService, private readonly genresService: GenreService, private readonly cacheService: CacheService) {}
  
    async search(search: SearchArgs): Promise<SearchResponse> {
        const cacheKey = this.cacheService.generateHashKey('search', search);
        const cached = await this.cacheService.get<SearchResponse>(cacheKey);
        if (cached) return cached;

        const [books, authors, genres] = await Promise.all([
            this.booksService.applySearch(search.query, search.filter),
            this.authorsService.applySearch(search.query, search.filter),
            this.genresService.applySearch(search.query)
        ]);
            
        const result = { books: { data: books.data, totalCount: books.totalCount, }, authors: { data: authors.data, totalCount: authors.totalCount, }, genres: { data: genres.data, totalCount: genres.totalCount, } };
        await this.cacheService.set(cacheKey, result);
        return result;
    }
}
