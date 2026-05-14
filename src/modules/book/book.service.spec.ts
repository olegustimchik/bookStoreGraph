import { Test } from '@nestjs/testing';
import { BookRepository } from './book.repository';
import { BookService } from './book.service';
import { AuthorRepository } from '../author/author.repository';
import { GenreRepository } from '../genre/genre.repository';
import type { Book } from './entities/book.entity';
import type { TestingModule } from '@nestjs/testing';

describe('BookService', () => {
  let service: BookService;
  let bookRepo: Record<string, jest.Mock>;

  const mockBook = {
    id: 'b1',
    title: 'Harry Potter 1',
    publicationDate: new Date('1997-06-26'),
    author: { id: 'a1' },
    genres: []
  } as unknown as Book;

  beforeEach(async () => {
    const mockBookRepo = {
      save: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockGenreRepo = { find: jest.fn() };
    const mockAuthorRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        { provide: BookRepository, useValue: mockBookRepo },
        { provide: GenreRepository, useValue: mockGenreRepo },
        { provide: AuthorRepository, useValue: mockAuthorRepo },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    bookRepo = module.get(BookRepository);
  });

  it('should save a book successfully', async () => {
    const input = { title: 'Harry Potter 1', publicationDate: new Date('1997-06-26'), authorId: 'a1' };
    bookRepo.save.mockResolvedValue(mockBook);

    const result = await service.create(input);
    expect(bookRepo.save).toHaveBeenCalled();
    expect(result.title).toBe('Harry Potter 1');
  });

  it('should find all books using offset and limit', async () => {
    bookRepo.findAndCount.mockResolvedValue([[mockBook], 1]);
    const result = await service.findBooks({ limit: 10, offset: 0 });
    
    expect(result.data).toEqual([mockBook]);
    expect(result.totalCount).toBe(1);
    expect(result.hasNextPage).toBe(false);
  });

  it('should delete a book successfully', async () => {
    bookRepo.findOne.mockResolvedValue(mockBook);
    bookRepo.delete.mockResolvedValue(mockBook as any);

    const result = await service.remove('b1');
    expect(result.id).toBe('b1');
    expect(bookRepo.delete).toHaveBeenCalledWith({ id: 'b1' });
  });
});
