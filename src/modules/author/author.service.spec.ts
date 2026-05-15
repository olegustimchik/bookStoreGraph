import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthorRepository } from './author.repository';
import { AuthorService } from './author.service';
import { CacheService } from '../cache/cache.service';
import type { Author } from './entities/author.entity';
import type { TestingModule } from '@nestjs/testing';

describe('AuthorService', () => {
  let service: AuthorService;
  let repository: Record<string, jest.Mock>;
  let cacheService: Record<string, jest.Mock>;

  const mockAuthor = {
    id: '12345',
    fullName: 'J.K. Rowling',
    dateOfBirth: new Date('1965-07-31'),
    books: [],
    createdAt: new Date(),
    updatedAt: new Date()
  } as unknown as Author;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createSelectQueryBuilder: jest.fn(),
      applyGlobalSearch: jest.fn(),
      execSelectQueryBuilder: jest.fn(),
    };

    const mockCacheService = {
      generateHashKey: jest.fn().mockReturnValue('mocked-hash'),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorService,
        {
          provide: AuthorRepository,
          useValue: mockRepo,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<AuthorService>(AuthorService);
    repository = module.get(AuthorRepository);
    cacheService = module.get(CacheService);
  });

  describe('create', () => {
    it('should create an author', async () => {
      const input = { fullName: 'J.K. Rowling', dateOfBirth: new Date('1965-07-31') };
      repository.create.mockResolvedValue(mockAuthor);

      const result = await service.create(input);
      expect(repository.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockAuthor);
    });
  });

  describe('findAuthors', () => {
    it('should return from cache if exists', async () => {
      const cached = { data: [mockAuthor], totalCount: 1, hasNextPage: false };
      cacheService.get.mockResolvedValue(cached);

      const result = await service.findAuthors({ limit: 10, offset: 0 });
      expect(result).toEqual(cached);
      expect(repository.findAndCount).not.toHaveBeenCalled();
    });

    it('should fetch mapping query without filters', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.findAndCount.mockResolvedValue([[mockAuthor], 1]);

      const result = await service.findAuthors({ limit: 10, offset: 0 });
      expect(result.data).toEqual([mockAuthor]);
      expect(result.totalCount).toBe(1);
    });

    it('should query with term mapping bounds', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.findAndCount.mockResolvedValue([[mockAuthor], 1]);

      const inputFromObj = new Date('2020-01-01');
      const inputToObj = new Date('2023-01-01');
      
      const result = await service.findAuthors({ 
        limit: 10, 
        offset: 0, 
        query: '   JK    rowling ', 
        from: inputFromObj, 
        to: inputToObj 
      });
      
      expect(result.data).toEqual([mockAuthor]);
      expect(repository.findAndCount).toHaveBeenCalled();
    });

    it('should query from param exclusively', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.findAndCount.mockResolvedValue([[mockAuthor], 1]);
      await service.findAuthors({ limit: 10, offset: 0, from: new Date('2020-01-01') });
      expect(repository.findAndCount).toHaveBeenCalled();
    });

    it('should query to param exclusively', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.findAndCount.mockResolvedValue([[mockAuthor], 1]);
      await service.findAuthors({ limit: 10, offset: 0, to: new Date('2020-01-01') });
      expect(repository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findAuthor', () => {
    it('should return from cache if exists', async () => {
      cacheService.get.mockResolvedValue(mockAuthor);
      const result = await service.findAuthor('12345');
      expect(result).toEqual(mockAuthor);
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should find an author by id and set cache', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(mockAuthor);
      const result = await service.findAuthor('12345');
      
      expect(result).toEqual(mockAuthor);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '12345' } });
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should throw an error if author is not found', async () => {
      cacheService.get.mockResolvedValue(null);
      // Notice minimal cast handling using jest mocks natively
      repository.findOne.mockResolvedValue(null);
      await expect(service.findAuthor('999')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateAuthor', () => {
    it('should throw Error if author does not exist', async () => {
      jest.spyOn(service, 'findAuthor').mockRejectedValue(new BadRequestException('Author with ID 999 not found'));
      
      await expect(service.updateAuthor({ id: '999', fullName: 'Jack' })).rejects.toThrow(BadRequestException);
    });

    it('should update and return author successfully', async () => {
      jest.spyOn(service, 'findAuthor').mockResolvedValue(mockAuthor);
      const updated = { ...mockAuthor, fullName: 'Jack' };
      repository.update.mockResolvedValue(updated);
      
      const result = await service.updateAuthor({ id: '12345', fullName: 'Jack' });
      expect(result.fullName).toBe('Jack');
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove and return an author', async () => {
      repository.delete.mockResolvedValue(mockAuthor);
      const result = await service.remove('12345');
      expect(result).toEqual(mockAuthor);
      expect(repository.delete).toHaveBeenCalledWith({ id: '12345' });
    });
  });

  describe('applySearch and applyFilter', () => {
    it('should return query builder result sets un-filtered thoroughly', async () => {
      const qbMock = { orderBy: jest.fn() };
      repository.createSelectQueryBuilder.mockReturnValue(qbMock);
      repository.execSelectQueryBuilder.mockResolvedValue({ data: [mockAuthor], totalCount: 1 });

      const result = await service.applySearch('Joanne', undefined);

      expect(repository.applyGlobalSearch).toHaveBeenCalledWith(qbMock, 'Joanne', ['author.full_name']);
      expect(qbMock.orderBy).toHaveBeenCalledWith('author.full_name', 'ASC');
      expect(result.data).toEqual([mockAuthor]);
    });

    it('should apply fully restricted bounds correctly resolving both boundaries', async () => {
      const qbMock = { orderBy: jest.fn(), andWhere: jest.fn() };
      repository.createSelectQueryBuilder.mockReturnValue(qbMock);
      repository.execSelectQueryBuilder.mockResolvedValue({ data: [mockAuthor], totalCount: 1 });

      await service.applySearch(undefined, { publicationYear: { from: 1995, to: 2005 } });
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        '(EXTRACT(YEAR FROM author.date_of_birth) <= :to AND (EXTRACT(YEAR FROM author.date_of_death) >= :from OR author.date_of_death IS NULL))',
        { from: 1995, to: 2005 }
      );
    });

    it('should apply boundary restriction solely from one interval - greater matches limits correctly (from)', async () => {
      const qbMock = { orderBy: jest.fn(), andWhere: jest.fn() };
      repository.createSelectQueryBuilder.mockReturnValue(qbMock);
      repository.execSelectQueryBuilder.mockResolvedValue({ data: [mockAuthor], totalCount: 1 });

      await service.applySearch(undefined, { publicationYear: { from: 1995 } });
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        '(EXTRACT(YEAR FROM author.date_of_death) >= :from OR author.date_of_death IS NULL)',
        { from: 1995 }
      );
    });

    it('should apply boundary restriction conversely across left limit - (to)', async () => {
      const qbMock = { orderBy: jest.fn(), andWhere: jest.fn() };
      repository.createSelectQueryBuilder.mockReturnValue(qbMock);
      repository.execSelectQueryBuilder.mockResolvedValue({ data: [mockAuthor], totalCount: 1 });

      await service.applySearch(undefined, { publicationYear: { to: 1995 } });
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        'EXTRACT(YEAR FROM author.date_of_birth) <= :to',
        { to: 1995 }
      );
    });
  });
});

