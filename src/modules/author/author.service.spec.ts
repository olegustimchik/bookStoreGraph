import { Test } from '@nestjs/testing';
import { AuthorRepository } from './author.repository';
import { AuthorService } from './author.service';
import type { Author } from './entities/author.entity';
import type { TestingModule } from '@nestjs/testing';

describe('AuthorService', () => {
  let service: AuthorService;
  let repository: Record<string, jest.Mock>;

  const mockAuthor = {
    id: '12345',
    fullName: 'J.K. Rowling',
    dateOfBirth: new Date('1965-07-31'),
    books: []
  } as unknown as Author;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorService,
        {
          provide: AuthorRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<AuthorService>(AuthorService);
    repository = module.get(AuthorRepository);
  });

  it('should create an author', async () => {
    const input = { fullName: 'J.K. Rowling', dateOfBirth: new Date('1965-07-31') };
    repository.create.mockResolvedValue(mockAuthor);

    const result = await service.create(input);
    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockAuthor);
  });

  it('should find all authors and return paginated response', async () => {
    repository.findAndCount.mockResolvedValue([[mockAuthor], 1]);
    const result = await service.findAuthors({ limit: 10, offset: 0 });
    
    expect(result.data).toEqual([mockAuthor]);
    expect(result.totalCount).toBe(1);
  });

  it('should find an author by id', async () => {
    repository.findOne.mockResolvedValue(mockAuthor);
    const result = await service.findAuthor('12345');
    
    expect(result).toEqual(mockAuthor);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '12345' } });
  });

  it('should throw an error if author mapping is corrupt', async () => {
    repository.findOne.mockResolvedValue(null as any);
    await expect(service.findAuthor('999')).rejects.toThrow();
  });
});
