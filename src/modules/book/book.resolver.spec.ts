import { Test } from '@nestjs/testing';
import { BookResolver } from './book.resolver';
import { BookService } from './book.service';
import { GqlThrottlerGuard } from '../rate-limiting/gql-throttler.guard';
import type { CreateBookInput } from './dto/request/create-book.request.dto';
import type { GetBooksArgs } from './dto/request/get-books.request.dto';
import type { UpdateBookInput } from './dto/request/update-book.request.dto';
import type { Book } from './entities/book.entity';
import type { TestingModule } from '@nestjs/testing';


describe('BookResolver', () => {
  let resolver: BookResolver;
  let service: Record<string, jest.Mock>;

  const mockBook: Book = {
    id: 'b1',
    title: 'Test Book',
    publicationDate: new Date(),
    author: { id: 'a1', deletedAt: undefined, fullName: 'Test Author', dateOfBirth: new Date(), books: [], createdAt: new Date(), updatedAt: new Date() },
    genres: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      updateBook: jest.fn(),
      remove: jest.fn(),
      findBooks: jest.fn(),
      findBook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookResolver,
        {
          provide: BookService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(GqlThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<BookResolver>(BookResolver);
    service = module.get(BookService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createBook', () => {
    it('should create a book', async () => {
      const input: CreateBookInput = { title: 'Test', authorId: 'a1', publicationDate: new Date() };
      service.create.mockResolvedValue(mockBook);
      const result = await resolver.createBook(input);
      expect(result).toEqual(mockBook);
      expect(service.create).toHaveBeenCalledWith(input);
    });
  });

  describe('updateBook', () => {
    it('should update a book', async () => {
      const input: UpdateBookInput = { id: 'b1', title: 'Updated' };
      service.updateBook.mockResolvedValue(mockBook);
      const result = await resolver.updateBook(input);
      expect(result).toEqual(mockBook);
      expect(service.updateBook).toHaveBeenCalledWith(input);
    });
  });

  describe('removeBook', () => {
    it('should remove a book', async () => {
      service.remove.mockResolvedValue(mockBook);
      const result = await resolver.removeBook('b1');
      expect(result).toEqual(mockBook);
      expect(service.remove).toHaveBeenCalledWith('b1');
    });
  });

  describe('findAllBooks', () => {
    it('should return paginated books', async () => {
      const args: GetBooksArgs = { limit: 10, offset: 0 };
      const paginatedResult = { data: [mockBook], totalCount: 1 };
      service.findBooks.mockResolvedValue(paginatedResult);
      const result = await resolver.findAllBooks(args);
      expect(result).toEqual(paginatedResult);
      expect(service.findBooks).toHaveBeenCalledWith(args);
    });
  });

  describe('findOneBook', () => {
    it('should return a single book', async () => {
      service.findBook.mockResolvedValue(mockBook);
      const result = await resolver.findOneBook('b1');
      expect(result).toEqual(mockBook);
      expect(service.findBook).toHaveBeenCalledWith('b1');
    });
  });
});
