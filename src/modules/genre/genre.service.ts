import { BadRequestException, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';
import { CreateGenreInput } from './dto/request/create-genre.request.dto';
import { GetGenresArgs } from './dto/request/get-genres.request.dto';
import { UpdateGenreInput } from './dto/request/update-genre.request.dto';
import { PaginateGenresResponse } from './dto/response/paginate-genres.response.dto';
import { Genre } from './entities/genre.entity';
import { GenreRepository } from './genre.repository';
import { BaseService } from '../../common/base/base.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class GenreService extends BaseService<Genre> {
  constructor(
    private readonly genreRepository: GenreRepository,
    private readonly cacheService: CacheService,
  ) {
    super(genreRepository);
  }

  async create(createGenreInput: CreateGenreInput): Promise<Genre> {
    return this.genreRepository.create(createGenreInput);
  }

  async findGenres(getGenresArgs: GetGenresArgs): Promise<PaginateGenresResponse> {
    const cacheKey = this.cacheService.generateHashKey('genres', getGenresArgs);
    const cached = await this.cacheService.get<PaginateGenresResponse>(cacheKey);
    if (cached) return cached;

    const where = getGenresArgs.query 
      ? { name: ILike(`%${getGenresArgs.query.trim().replace(/\s+/g, '%')}%`) } 
      : {};
    
    const [genres, totalCount] = await this.genreRepository.findAndCount({ where, skip: getGenresArgs.offset, take: getGenresArgs.limit });
    
    const result = {
      data: genres,
      totalCount,
      hasNextPage: getGenresArgs.offset + getGenresArgs.limit < totalCount,
    };

    await this.cacheService.set(cacheKey, result);
    return result;
  }

  async findGenre(id: string): Promise<Genre> {
    const cacheKey = this.cacheService.generateHashKey('genre', { id });
    const cached = await this.cacheService.get<Genre>(cacheKey);
    if (cached) return cached;

    const genre = await this.genreRepository.findOneOrFail({ where: { id } });
    if (!genre) {
      throw new BadRequestException(`Genre with ID ${id} not found`);
    }

    await this.cacheService.set(cacheKey, genre);
    return genre;
  }

  async updateGenre(updateGenreInput: UpdateGenreInput): Promise<Genre> {
    const genre = await this.findGenre(updateGenreInput.id);
    if (!genre) {
      throw new BadRequestException(`Genre with ID ${updateGenreInput.id} not found`);
    }

    const updatedGenre = await this.genreRepository.update({ ...genre, ...updateGenreInput });
   
    return updatedGenre;
  }

  async remove(id: string): Promise<Genre> {
    const genre = await this.genreRepository.delete({ id });
    return genre;
  }

  async applySearch(searchTerm: string | undefined): Promise<{ data: Genre[]; totalCount: number }> {
    const genresSelectQueryBuilder = this.genreRepository.createSelectQueryBuilder('genre');
    this.genreRepository.applyGlobalSearch(genresSelectQueryBuilder, searchTerm ?? '', ['genre.name']);
    genresSelectQueryBuilder.orderBy('genre.name', 'ASC');
    return await this.genreRepository.execSelectQueryBuilder(genresSelectQueryBuilder);
  }
}
