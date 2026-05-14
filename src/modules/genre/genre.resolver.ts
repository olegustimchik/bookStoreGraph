import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { GqlThrottlerGuard } from '../rate-limiting/gql-throttler.guard';
import { CreateGenreInput } from './dto/request/create-genre.dto';
import { GetGenresArgs } from './dto/request/get-genres.dto';
import { UpdateGenreInput } from './dto/request/update-genre.dto';
import { PaginateGenresResponse } from './dto/response/paginate-genres.response.dto';
import { Genre } from './entities/genre.entity';
import { GenreService } from './genre.service';

@Resolver()
@UseGuards(GqlThrottlerGuard)
export class GenreResolver {
    constructor(private readonly genreService: GenreService) {}

    @Mutation(() => Genre)
    async createGenre(@Args("createGenreInput") createGenreInput: CreateGenreInput): Promise<Genre> {
        const result = await this.genreService.create(createGenreInput);
        return result;
    }

    @Mutation(() => Genre)
    async updateGenre(
        @Args('updateGenreInput') updateGenreInput: UpdateGenreInput,
    ): Promise<Genre> {
        return await this.genreService.updateGenre(updateGenreInput);
    }

    @Mutation(() => Genre)
    async removeGenre(@Args('id') id: string): Promise<Genre> {
        return await this.genreService.remove(id);
    }

    @Query(() => PaginateGenresResponse, { name: 'genres' })
    async findAllGenres(@Args() getGenresArgs: GetGenresArgs): Promise<PaginateGenresResponse> {
        const result = await this.genreService.findGenres(getGenresArgs);
        return result;
    }
      
    @Query(() => Genre, { name: 'genre' })
    async findOneGenre(@Args('id') id: string): Promise<Genre> {
        return await this.genreService.findGenre(id);
    }
}
