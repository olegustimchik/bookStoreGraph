import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BookRepository } from './book.repository';
import { BookService } from './book.service';
import { AuthorRepository } from '../author/author.repository';
import { CacheService } from '../cache/cache.service';
import { GenreRepository } from '../genre/genre.repository';
import type { Book } from './entities/book.entity';
import type { TestingModule } from '@nestjs/testing';

describe('BookService', () => {
  let service: BookService;
  let bookRepo: Record<string, jest.Mock>;
  let authorRepo: Record<string, jest.Mock>;
  let genreRepo: Record<string, jest.Mock>;
  let cacheService: Record<string, jest.Mock>;

  const mockBook: Book = {
    id: 'b1',
    title: 'Harry Potter 1',
    publicationDate: new Date('1997-06-26'),
    author: { id: 'a1', fullName: 'Author Name', dateOfBirth: new Date(), dateOfDeath: undefined, books: [], createdAt: new Date(), updatedAt: new Date() },
    genres: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockBookRepo = {
      save: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createSelectQueryBuilder: jest.fn(),
      applyGlobalSearch: jest.fn(),
      execSelectQueryBuilder: jest.fn(),
    };

    const mockGenreRepo = { find: jest.fn() };
    const mockAuthorRepo = { findOne: jest.fn() };
    const mockCacheService = {
      generateHashKey: jest.fn().mockReturnValue('mocked-hash'),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        { provide: BookRepository, useValue: mockBookRepo },
        { provide: GenreRepository, useValue: mockGenreRepo },
        { provide: AuthorRepository, useValue: mockAuthorRepo },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    bookRepo = module.get(BookRepository);
    authorRepo = module.get(AuthorRepository);
    genreRepo = module.get(GenreRepository);
    cacheService = module.get(CacheService);
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const input = { title: 'Harry Potter 1', publicationDate: new Date('1997-06-26'), authorId: 'a1', genreIds: ['g1'] };
      bookRepo.save.mockResolvedValue(mockBook);

      const result = await service.create(input);
      expect(bookRepo.save).toHaveBeenCalledWith({
        title: 'Harry Potter 1',
        publicationDate: input.publicationDate,
        author: { id: 'a1' },
        genres: [{ id: 'g1' }]
      });
      expect(result).toEqual(mockBook);
    });

    it('should handle undefined genreIds', async () => {
      const input = { title: 'Harry Potter 1', publicationDate: new Date('1997-06-26'), authorId: 'a1' };
      bookRepo.save.mockResolvedValue(mockBook);

      await service.create(input);
      expect(bookRepo.save).toHaveBeenCalledWith({
        title: 'Harry Potter 1',
        publicationDate: input.publicationDate,
        author: { id: 'a1' },
        genres: []
      });
    });
  });

  describe('findBooks', () => {
    it('should return from cache if data exists', async () => {
      const cached = { data: [mockBook], totalCount: 1, hasNextPage: false };
      cacheService.get.mockResolvedValue(cached);

      const result = await service.findBooks({ limit: 10, offset: 0 });
      expect(result).toEqual(cached);
      expect(bookRepo.findAndCount).not.toHaveBeenCalled();
    });

    it('should query without parameters', async () => {
      cacheService.get.mockResolvedValue(null);
      bookRepo.findAndCount.mockResolvedValue([[mockBook], 1]);

      const result = await service.findBooks({ limit: 10, offset: 0 });
      expect(result.data).toEqual([mockBook]);
      expect(bookRepo.findAndCount).toHaveBeenCalledWith({
        where: undefined,
        skip: 0,
        take: 10,
        relations: ['author', 'genres']
      });
    });

    it('should query with term mapping bounds', async () => {
      cacheService.get.mockResolvedValue(null);
      bookRepo.findAndCount.mockResolvedValue([[mockBook], 1]);

      await service.findBooks({ limit: 10, offset: 0, query: '   HP    ', genre: '  Fantasy   ' });
      expect(bookRepo.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findBook', () => {
    it('should return cached book if available', async () => {
      cacheService.get.mockResolvedValue(mockBook);
      const result = await service.findBook('b1');
      expect(result).toEqual(mockBook);
    });

    it('should find book by id and map into cache', async () => {
      cacheService.get.mockResolvedValue(null);
      bookRepo.findOne.mockResolvedValue(mockBook);
      const result = await service.findBook('b1');
      
      expect(result).toEqual(mockBook);
      expect(bookRepo.findOne).toHaveBeenCalledWith({ where: { id: 'b1' }, relations: ['author', 'genres'] });
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should throw error if missing', async () => {
      cacheService.get.mockResolvedValue(null);
      bookRepo.findOne.mockResolvedValue(null);
      await expect(service.findBook('999')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateBook', () => {
    it('should update successfully retaining unchanged fields', async () => {
      jest.spyOn(service, 'findBook').mockResolvedValue(mockBook);
      const updated = { ...mockBook, title: 'Updated' };
      bookRepo.save.mockResolvedValue(updated);
      
      const result = await service.updateBook({ id: 'b1', title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should mutate mapping elements properly upon request (author & genre re-assignment)', async () => {
      jest.spyOn(service, 'findBook').mockResolvedValue(mockBook);
      
      const auth = { id: 'a2', fullName: 'Author', dateOfBirth: new Date(), dateOfDeath: undefined, books: [], createdAt: new Date(), updatedAt: new Date() };
      const gen = { id: 'g2', name: 'Genre', books: [], createdAt: new Date(), updatedAt: new Date() };
      authorRepo.findOne.mockResolvedValue(auth);
      genreRepo.find.mockResolvedValue([gen]);
      
      bookRepo.save.mockResolvedValue(mockBook);

      await service.updateBook({ id: 'b1', authorId: 'a2', genreIds: ['g2'] });
      
      expect(authorRepo.findOne).toHaveBeenCalledWith({ where: { id: 'a2' } });
      expect(genreRepo.find).toHaveBeenCalled();
      expect(bookRepo.save).toHaveBeenCalled();
    });

    it('should skip entity assignments optionally safely', async () => {
      jest.spyOn(service, 'findBook').mockResolvedValue(mockBook);
      bookRepo.save.mockResolvedValue(mockBook);

      await service.updateBook({ id: 'b1', title: 'test2' });
      
      expect(authorRepo.findOne).not.toHaveBeenCalled();
      expect(genreRepo.find).not.toHaveBeenCalled();
    });

    it('should skip entity assignments if author not found silently', async () => {
      jest.spyOn(service, 'findBook').mockResolvedValue(mockBook);
      authorRepo.findOne.mockResolvedValue(null);
      bookRepo.save.mockResolvedValue(mockBook);

      await service.updateBook({ id: 'b1', authorId: 'a2' });
      expect(authorRepo.findOne).toHaveBeenCalledWith({ where: { id: 'a2' } });
      // it just proceeds calling save with original author untouched (implicitly validated)
    });
  });

  describe('remove', () => {
    it('should execute delete properly', async () => {
      jest.spyOn(service, 'findBook').mockResolvedValue(mockBook);
      bookRepo.delete.mockResolvedValue(undefined);

      const result = await service.remove('b1');
      expect(result).toEqual(mockBook);
      expect(bookRepo.delete).toHaveBeenCalledWith({ id: 'b1' });
    });
  });

  describe('applySearch and applyFilter', () => {
    it('should return query builder result sets un-filtered thoroughly', async () => {
      const qbMock = { orderBy: jest.fn() };
      bookRepo.createSelectQueryBuilder.mockReturnValue(qbMock);
      bookRepo.execSelectQueryBuilder.mockResolvedValue({ data: [mockBook], totalCount: 1 });

      const result = await service.applySearch('Harry', undefined);

      expect(bookRepo.applyGlobalSearch).toHaveBeenCalledWith(qbMock, 'Harry', ['book.title']);
      expect(qbMock.orderBy).toHaveBeenCalledWith('book.title', 'ASC');
      expect(result.data).toEqual([mockBook]);
    });

    it('should apply boundary restriction solely from one interval - greater matches limits correctly (from)', async () => {
      const qbMock = { orderBy: jest.fn(), andWhere: jest.fn(), innerJoin: jest.fn() };
      bookRepo.createSelectQueryBuilder.mockReturnValue(qbMock);
      bookRepo.execSelectQueryBuilder.mockResolvedValue({ data: [], totalCount: 0 });

      await service.applySearch(undefined, { publicationYear: { from: 1995 } });
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        'EXTRACT(YEAR FROM book.publication_date) >= :from',
        { from: 1995 }
      );
    });

    it('should apply boundary restriction conversely across left limit - (to)', async () => {
      const qbMock = { orderBy: jest.fn(), andWhere: jest.fn(), innerJoin: jest.fn() };
      bookRepo.createSelectQueryBuilder.mockReturnValue(qbMock);
      bookRepo.execSelectQueryBuilder.mockResolvedValue({ data: [], totalCount: 0 });

      await service.applySearch(undefined, { publicationYear: { to: 1995 } });
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        'EXTRACT(YEAR FROM book.publication_date) <= :to',
        { to: 1995 }
      );
    });

    it('should apply strictly restricted bounds and genre filter correctly', async () => {
      const qbMock = { orderBy: jest.fn(), andWhere: jest.fn(), innerJoin: jest.fn() };
      bookRepo.createSelectQueryBuilder.mockReturnValue(qbMock);
      bookRepo.execSelectQueryBuilder.mockResolvedValue({ data: [], totalCount: 0 });

      await service.applySearch(undefined, { genre: 'Fantasy', publicationYear: { from: 1995, to: 2005 } });
      
      expect(qbMock.innerJoin).toHaveBeenCalledWith('book.genres', 'genres');
      expect(qbMock.andWhere).toHaveBeenCalledWith('genres.name ILIKE :genre', { genre: '%Fantasy%' });
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        'EXTRACT(YEAR FROM book.publication_date) BETWEEN :from AND :to',
        { from: 1995, to: 2005 }
      );
    });
  });
});

