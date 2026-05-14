import { BadRequestException, Injectable } from '@nestjs/common';
import { ILike, In } from 'typeorm';
import { BookRepository } from './book.repository';
import { AuthorRepository } from '../author/author.repository';
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
  ) {
    super(bookRepository);
  }

  async create(createBookInput: CreateBookInput): Promise<Book> {
    const { authorId, genreIds, ...bookData } = createBookInput;
    const author = { id: authorId } as any;
    const genres = genreIds ? genreIds.map((id) => ({ id } as any)) : [];
    
    return await this.bookRepository.save({
      ...bookData,
      author,
      genres,
    });
  }

  async findBooks(getBooksArgs: GetBooksArgs): Promise<PaginateBooksResponse> {
    const where: any = {};
    if (getBooksArgs.query) {
      where.title = ILike(`%${getBooksArgs.query.trim().replace(/\s+/g, '%')}%`);
    }
    if (getBooksArgs.genreId) {
      where.genres = { id: getBooksArgs.genreId };
    }
    
    const [books, totalCount] = await this.bookRepository.findAndCount({ 
      where, 
      skip: getBooksArgs.offset, 
      take: getBooksArgs.limit,
      relations: ['author', 'genres']
    });
    
    return {
      data: books,
      totalCount,
      hasNextPage: getBooksArgs.offset + getBooksArgs.limit < totalCount,
    };
  }

  async findBook(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({ 
      where: { id },
      relations: ['author', 'genres']
    });
    if (!book) {
      throw new BadRequestException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async updateBook(updateBookInput: UpdateBookInput): Promise<Book> {
    const book = await this.findBook(updateBookInput.id);
    if (!book) {
      throw new BadRequestException(`Book with ID ${updateBookInput.id} not found`);
    }

    const { authorId, genreIds, id, ...updateData } = updateBookInput;
    
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
