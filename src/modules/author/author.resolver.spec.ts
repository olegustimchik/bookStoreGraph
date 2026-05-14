import { Test } from '@nestjs/testing';
import { AuthorResolver } from './author.resolver';
import { AuthorService } from './author.service';
import { GqlThrottlerGuard } from '../rate-limiting/gql-throttler.guard';
import type { CreateAuthorInput } from './dto/request/create-author.dto';
import type { GetAuthorsArgs } from './dto/request/get-authors.dto';
import type { UpdateAuthorInput } from './dto/request/update-author.dto';
import type { Author } from './entities/author.entity';
import type { TestingModule } from '@nestjs/testing';


describe('AuthorResolver', () => {
  let resolver: AuthorResolver;
  let service: Record<string, jest.Mock>;

  const mockAuthor: Author = {
    id: 'a1',
    fullName: 'J.K. Rowling',
    dateOfBirth: new Date('1965-07-31'),
    books: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      updateAuthor: jest.fn(),
      remove: jest.fn(),
      findAuthors: jest.fn(),
      findAuthor: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorResolver,
        {
          provide: AuthorService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(GqlThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<AuthorResolver>(AuthorResolver);
    service = module.get(AuthorService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createAuthor', () => {
    it('should create an author', async () => {
      const input: CreateAuthorInput = { fullName: 'Test', dateOfBirth: new Date() };
      service.create.mockResolvedValue(mockAuthor);
      const result = await resolver.createAuthor(input);
      expect(result).toEqual(mockAuthor);
      expect(service.create).toHaveBeenCalledWith(input);
    });
  });

  describe('updateAuthor', () => {
    it('should update an author', async () => {
      const input: UpdateAuthorInput = { id: 'a1', fullName: 'Updated' };
      service.updateAuthor.mockResolvedValue(mockAuthor);
      const result = await resolver.updateAuthor(input);
      expect(result).toEqual(mockAuthor);
      expect(service.updateAuthor).toHaveBeenCalledWith(input);
    });
  });

  describe('removeAuthor', () => {
    it('should remove an author', async () => {
      service.remove.mockResolvedValue(mockAuthor);
      const result = await resolver.removeAuthor('a1');
      expect(result).toEqual(mockAuthor);
      expect(service.remove).toHaveBeenCalledWith('a1');
    });
  });

  describe('findAllAuthors', () => {
    it('should return paginated authors', async () => {
      const args: GetAuthorsArgs = { limit: 10, offset: 0 };
      const paginatedResult = { data: [mockAuthor], totalCount: 1 };
      service.findAuthors.mockResolvedValue(paginatedResult);
      const result = await resolver.findAllAuthors(args);
      expect(result).toEqual(paginatedResult);
      expect(service.findAuthors).toHaveBeenCalledWith(args);
    });
  });

  describe('findOneAuthor', () => {
    it('should return a single author', async () => {
      service.findAuthor.mockResolvedValue(mockAuthor);
      const result = await resolver.findOneAuthor('a1');
      expect(result).toEqual(mockAuthor);
      expect(service.findAuthor).toHaveBeenCalledWith('a1');
    });
  });
});
