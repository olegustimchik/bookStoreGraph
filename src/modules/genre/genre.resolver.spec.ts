import { Test } from '@nestjs/testing';
import { GenreResolver } from './genre.resolver';
import { GenreService } from './genre.service';
import { GqlThrottlerGuard } from '../rate-limiting/gql-throttler.guard';
import type { CreateGenreInput } from './dto/request/create-genre.request.dto';
import type { GetGenresArgs } from './dto/request/get-genres.request.dto';
import type { UpdateGenreInput } from './dto/request/update-genre.request.dto';
import type { Genre } from './entities/genre.entity';
import type { TestingModule } from '@nestjs/testing';


describe('GenreResolver', () => {
  let resolver: GenreResolver;
  let service: Record<string, jest.Mock>;

  const mockGenre: Genre = {
    id: 'g1',
    name: 'Sci-Fi',
    books: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      updateGenre: jest.fn(),
      remove: jest.fn(),
      findGenres: jest.fn(),
      findGenre: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreResolver,
        {
          provide: GenreService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(GqlThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<GenreResolver>(GenreResolver);
    service = module.get(GenreService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createGenre', () => {
    it('should create a genre', async () => {
      const input: CreateGenreInput = { name: 'Test' };
      service.create.mockResolvedValue(mockGenre);
      const result = await resolver.createGenre(input);
      expect(result).toEqual(mockGenre);
      expect(service.create).toHaveBeenCalledWith(input);
    });
  });

  describe('updateGenre', () => {
    it('should update a genre', async () => {
      const input: UpdateGenreInput = { id: 'g1', name: 'Updated' };
      service.updateGenre.mockResolvedValue(mockGenre);
      const result = await resolver.updateGenre(input);
      expect(result).toEqual(mockGenre);
      expect(service.updateGenre).toHaveBeenCalledWith(input);
    });
  });

  describe('removeGenre', () => {
    it('should remove a genre', async () => {
      service.remove.mockResolvedValue(mockGenre);
      const result = await resolver.removeGenre('g1');
      expect(result).toEqual(mockGenre);
      expect(service.remove).toHaveBeenCalledWith('g1');
    });
  });

  describe('findAllGenres', () => {
    it('should return paginated genres', async () => {
      const args: GetGenresArgs = { limit: 10, offset: 0 };
      const paginatedResult = { data: [mockGenre], totalCount: 1 };
      service.findGenres.mockResolvedValue(paginatedResult);
      const result = await resolver.findAllGenres(args);
      expect(result).toEqual(paginatedResult);
      expect(service.findGenres).toHaveBeenCalledWith(args);
    });
  });

  describe('findOneGenre', () => {
    it('should return a single genre', async () => {
      service.findGenre.mockResolvedValue(mockGenre);
      const result = await resolver.findOneGenre('g1');
      expect(result).toEqual(mockGenre);
      expect(service.findGenre).toHaveBeenCalledWith('g1');
    });
  });
});
