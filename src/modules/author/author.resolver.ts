import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthorService } from './author.service';
import { GqlThrottlerGuard } from '../rate-limiting/gql-throttler.guard';
import { CreateAuthorInput } from './dto/request/create-author.request.dto';
import { GetAuthorsArgs } from './dto/request/get-authors.request.dto';
import { UpdateAuthorInput } from './dto/request/update-author.request.dto';
import { PaginateAuthorsResponse } from './dto/response/paginate-authors.response.dto';
import { Author } from './entities/author.entity';

@Resolver()
@UseGuards(GqlThrottlerGuard)
export class AuthorResolver {
    constructor(private readonly authorService: AuthorService) {}

    @Mutation(() => Author)
    async createAuthor(@Args("createAuthorInput") createAuthorInput: CreateAuthorInput): Promise<Author> {
        return await this.authorService.create(createAuthorInput);
    }

    @Mutation(() => Author)
    async updateAuthor(
        @Args('updateAuthorInput') updateAuthorInput: UpdateAuthorInput,
    ): Promise<Author> {
        return await this.authorService.updateAuthor(updateAuthorInput);
    }

    @Mutation(() => Author)
    async removeAuthor(@Args('id') id: string): Promise<Author> {
        return await this.authorService.remove(id);
    }

    @Query(() => PaginateAuthorsResponse, { name: 'authors' })
    async findAllAuthors(@Args() getAuthorsArgs: GetAuthorsArgs): Promise<PaginateAuthorsResponse> {
        return await this.authorService.findAuthors(getAuthorsArgs);
    }
      
    @Query(() => Author, { name: 'author' })
    async findOneAuthor(@Args('id') id: string): Promise<Author> {
        return await this.authorService.findAuthor(id);
    }
}
