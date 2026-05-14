import { BadRequestException, Injectable } from '@nestjs/common';
import { FindManyOptions, ILike, In } from 'typeorm';
import { BookRepository } from './book.repository';
import { AuthorRepository } from '../author/author.repository';
import { CacheService } from '../cache/cache.service';
import { CreateBookInput } from './dto/request/create-book.dto';
import { GetBooksArgs } from './dto/request/get-books.dto';
import { UpdateBookInput } from './dto/request/update-book.dto';
import { PaginateBooksResponse } from './dto/response/paginate-books.response.dto';
import { Book } from './entities/book.entity';
import { BaseService } from '../../common/base/base.service';
import { GenreRepository } from '../genre/genre.repository';


@Injectable()
export class BookService extends BaseService<Book> {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly genreRepository: GenreRepository,
    private readonly authorRepository: AuthorRepository,
    private readonly cacheService: CacheService,
  ) {
    super(bookRepository);
  }

  async create(createBookInput: CreateBookInput): Promise<Book> {
    const { authorId, genreIds, ...bookData } = createBookInput;
    const author = { id: authorId };
    const genres = genreIds ? genreIds.map((id) => ({ id })) : [];
    
    return await this.bookRepository.save({
      ...bookData,
      author,
      genres,
    });
  }

  async findBooks(getBooksArgs: GetBooksArgs): Promise<PaginateBooksResponse> {
    const cacheKey = this.cacheService.generateHashKey('books', getBooksArgs);
    const cached = await this.cacheService.get<PaginateBooksResponse>(cacheKey);
    if (cached) return cached;

    const where: FindManyOptions<Book> = {};
    if (getBooksArgs.query) {
      where.where = { title: ILike(`%${getBooksArgs.query.trim().replace(/\s+/g, '%')}%`) };
    }
    if (getBooksArgs.genre) {
      where.where = { ...where.where, genres: { name: ILike(`%${getBooksArgs.genre.trim().replace(/\s+/g, '%')}%`) } };
    }
    
    const [books, totalCount] = await this.bookRepository.findAndCount({ 
      where: where.where, 
      skip: getBooksArgs.offset, 
      take: getBooksArgs.limit,
      relations: ['author', 'genres']
    });
    
    const result = {
      data: books,
      totalCount,
      hasNextPage: getBooksArgs.offset + getBooksArgs.limit < totalCount,
    };

    await this.cacheService.set(cacheKey, result);
    return result;
  }

  async findBook(id: string): Promise<Book> {
    const cacheKey = this.cacheService.generateHashKey('book', { id });
    const cached = await this.cacheService.get<Book>(cacheKey);
    if (cached) return cached;

    const book = await this.bookRepository.findOne({ 
      where: { id },
      relations: ['author', 'genres']
    });
    if (!book) {
      throw new BadRequestException(`Book with ID ${id} not found`);
    }

    await this.cacheService.set(cacheKey, book);
    return book;
  }

  async updateBook(updateBookInput: UpdateBookInput): Promise<Book> {
    const book = await this.findBook(updateBookInput.id);
    if (!book) {
      throw new BadRequestException(`Book with ID ${updateBookInput.id} not found`);
    }

    const { authorId, genreIds, id: _, ...updateData } = updateBookInput;
    
    const author = authorId ? await this.authorRepository.findOne({ where: { id: authorId } }) : null;
    if (authorId && author) {
      book.author = author;
    }

    const genres = genreIds ? await this.genreRepository.find({ where: { id: In(genreIds) } }) : null;
    if (genreIds && genres) {
      book.genres = genres;
    }

    const updatedBook = await this.bookRepository.save({ ...book, ...updateData});
    return updatedBook;
  }

  async remove(id: string): Promise<Book> {
    const book = await this.findBook(id);
    await this.bookRepository.delete({ id });
    return book;
  }
}
