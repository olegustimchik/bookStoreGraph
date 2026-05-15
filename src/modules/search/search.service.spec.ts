import { Test } from '@nestjs/testing';
import { SearchService } from './search.service';
import { AuthorService } from '../author/author.service';
import { BookService } from '../book/book.service';
import { CacheService } from '../cache/cache.service';
import { GenreService } from '../genre/genre.service';
import type { SearchArgs } from './dto/request/search-input.request.dto';
import type { TestingModule } from '@nestjs/testing';

describe('SearchService', () => {
  let service: SearchService;
  let cacheService: jest.Mocked<CacheService>;
  let booksService: jest.Mocked<BookService>;
  let authorsService: jest.Mocked<AuthorService>;
  let genresService: jest.Mocked<GenreService>;

  beforeEach(async () => {
    const mockCacheService = {
      generateHashKey: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    };

    const mockBooksService = { applySearch: jest.fn() };
    const mockAuthorsService = { applySearch: jest.fn() };
    const mockGenresService = { applySearch: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: BookService, useValue: mockBooksService },
        { provide: AuthorService, useValue: mockAuthorsService },
        { provide: GenreService, useValue: mockGenresService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    cacheService = module.get(CacheService);
    booksService = module.get(BookService);
    authorsService = module.get(AuthorService);
    genresService = module.get(GenreService);
  });

  it('should return from cache if data exists', async () => {
    const searchArgs: SearchArgs = { query: 'test' };
    const cachedResult = { books: { data: [], totalCount: 0 }, authors: { data: [], totalCount: 0 }, genres: { data: [], totalCount: 0 } };
    
    const generateHashKeySpy = jest.spyOn(cacheService, 'generateHashKey').mockReturnValue('search:hash');
    const getSpy = jest.spyOn(cacheService, 'get').mockResolvedValue(cachedResult);
    const applySearchBooksSpy = jest.spyOn(booksService, 'applySearch');

    const result = await service.search(searchArgs);

    expect(generateHashKeySpy).toHaveBeenCalledWith('search', searchArgs);
    expect(getSpy).toHaveBeenCalledWith('search:hash');
    expect(result).toEqual(cachedResult);
    expect(applySearchBooksSpy).not.toHaveBeenCalled();
  });

  it('should fetch from services and cache the result if not in cache', async () => {
    const searchArgs: SearchArgs = { query: 'test' };
    const resultBooks = { data: [{ id: '1', title: 'test book', publicationDate: new Date(), author: { id: 'a1', fullName: '', dateOfBirth: new Date(), books: [], createdAt: new Date(), updatedAt: new Date() }, genres: [], createdAt: new Date(), updatedAt: new Date() }], totalCount: 1 };
    const resultAuthors = { data: [{ id: '2', fullName: 'test author', dateOfBirth: new Date(), books: [], createdAt: new Date(), updatedAt: new Date() }], totalCount: 1 };
    const resultGenres = { data: [{ id: '3', name: 'test genre', books: [], createdAt: new Date(), updatedAt: new Date() }], totalCount: 1 };

    const generateHashKeySpy = jest.spyOn(cacheService, 'generateHashKey').mockReturnValue('search:hash');
    const getSpy = jest.spyOn(cacheService, 'get').mockResolvedValue(null);
    const setSpy = jest.spyOn(cacheService, 'set').mockResolvedValue();
    
    const applySearchBooksSpy = jest.spyOn(booksService, 'applySearch').mockResolvedValue(resultBooks);
    const applySearchAuthorsSpy = jest.spyOn(authorsService, 'applySearch').mockResolvedValue(resultAuthors);
    const applySearchGenresSpy = jest.spyOn(genresService, 'applySearch').mockResolvedValue(resultGenres);

    const result = await service.search(searchArgs);

    expect(applySearchBooksSpy).toHaveBeenCalledWith('test', undefined);
    expect(applySearchAuthorsSpy).toHaveBeenCalledWith('test', undefined);
    expect(applySearchGenresSpy).toHaveBeenCalledWith('test');
    expect(setSpy).toHaveBeenCalledWith('search:hash', {
      books: resultBooks,
      authors: resultAuthors,
      genres: resultGenres,
    });
    expect(result).toEqual({
      books: resultBooks,
      authors: resultAuthors,
      genres: resultGenres,
    });
  });
});
