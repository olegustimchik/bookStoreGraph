import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { BookService } from './book.service';
import { GqlThrottlerGuard } from '../rate-limiting/gql-throttler.guard';
import { CreateBookInput } from './dto/request/create-book.dto';
import { GetBooksArgs } from './dto/request/get-books.dto';
import { UpdateBookInput } from './dto/request/update-book.dto';
import { PaginateBooksResponse } from './dto/response/paginate-books.response.dto';
import { Book } from './entities/book.entity';

@Resolver()
@UseGuards(GqlThrottlerGuard)
export class BookResolver {
    constructor(private readonly bookService: BookService) {}

    @Mutation(() => Book)
    async createBook(@Args("createBookInput") createBookInput: CreateBookInput): Promise<Book> {
        return await this.bookService.create(createBookInput);
    }

    @Mutation(() => Book)
    async updateBook(
        @Args('updateBookInput') updateBookInput: UpdateBookInput,
    ): Promise<Book> {
        return await this.bookService.updateBook(updateBookInput);
    }

    @Mutation(() => Book)
    async removeBook(@Args('id') id: string): Promise<Book> {
        return await this.bookService.remove(id);
    }

    @Query(() => PaginateBooksResponse, { name: 'books' })
    async findAllBooks(@Args() getBooksArgs: GetBooksArgs): Promise<PaginateBooksResponse> {
        return await this.bookService.findBooks(getBooksArgs);
    }
      
    @Query(() => Book, { name: 'book' })
    async findOneBook(@Args('id') id: string): Promise<Book> {
        return await this.bookService.findBook(id);
    }
}
