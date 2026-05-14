import { Test } from '@nestjs/testing';
import { GenreRepository } from './genre.repository';
import { GenreService } from './genre.service';
import type { Genre } from './entities/genre.entity';
import type { TestingModule } from '@nestjs/testing';

describe('GenreService', () => {
  let service: GenreService;
  let repository: Record<string, jest.Mock>;

  const mockGenre = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Fantasy',
  } as Genre;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findAndCount: jest.fn(),
      findOneOrFail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        {
          provide: GenreRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<GenreService>(GenreService);
    repository = module.get(GenreRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre', async () => {
      const input = { name: 'Fantasy' };
      repository.create.mockResolvedValue(mockGenre);

      const result = await service.create(input);
      expect(repository.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockGenre);
    });
  });

  describe('findGenres', () => {
    it('should return paginated genres', async () => {
      const args = { limit: 10, offset: 0 };
      repository.findAndCount.mockResolvedValue([[mockGenre], 1]);

      const result = await service.findGenres(args);
      expect(result.data).toEqual([mockGenre]);
      expect(result.totalCount).toBe(1);
    });
  });

  describe('findGenre', () => {
    it('should return a genre by id', async () => {
      repository.findOneOrFail.mockResolvedValue(mockGenre);
      const result = await service.findGenre(mockGenre.id);
      expect(result).toEqual(mockGenre);
    });

    it('should throw an error if genre not found by ID mapping', async () => {
       repository.findOneOrFail.mockRejectedValue(new Error('Not found'));
       await expect(service.findGenre('wrong-id')).rejects.toThrow();
    });
  });

  describe('updateGenre', () => {
    it('should update and return a genre', async () => {
      const input = { id: mockGenre.id, name: 'Sci-Fi' };
      repository.findOneOrFail.mockResolvedValue(mockGenre);
      repository.update.mockResolvedValue({ ...mockGenre, ...input });

      const result = await service.updateGenre(input);
      expect(repository.update).toHaveBeenCalled();
      expect(result.name).toBe('Sci-Fi');
    });
  });

  describe('remove', () => {
    it('should remove a genre', async () => {
      repository.delete.mockResolvedValue(mockGenre);
      const result = await service.remove(mockGenre.id);
      expect(repository.delete).toHaveBeenCalledWith({ id: mockGenre.id });
      expect(result).toEqual(mockGenre);
    });
  });
});
