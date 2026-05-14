import { BadRequestException, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';
import { CreateGenreInput } from './dto/request/create-genre.dto';
import { GetGenresArgs } from './dto/request/get-genres.dto';
import { UpdateGenreInput } from './dto/request/update-genre.dto';
import { PaginateGenresResponse } from './dto/response/paginate-genres.response.dto';
import { Genre } from './entities/genre.entity';
import { GenreRepository } from './genre.repository';
import { BaseService } from '../../common/base/base.service';

@Injectable()
export class GenreService extends BaseService<Genre> {
  constructor(
    private readonly genreRepository: GenreRepository,
  ) {
    super(genreRepository);
  }

  async create(createGenreInput: CreateGenreInput): Promise<Genre> {
    return this.genreRepository.create(createGenreInput);
  }

  async findGenres(getGenresArgs: GetGenresArgs): Promise<PaginateGenresResponse> {
    const where = getGenresArgs.query 
      ? { name: ILike(`%${getGenresArgs.query.trim().replace(/\s+/g, '%')}%`) } 
      : {};
    
    const [genres, totalCount] = await this.genreRepository.findAndCount({ where, skip: getGenresArgs.offset, take: getGenresArgs.limit });
    
    return {
      data: genres,
      totalCount,
      hasNextPage: getGenresArgs.offset + getGenresArgs.limit < totalCount,
    };
  }

  async findGenre(id: string): Promise<Genre> {
    const genre = await this.genreRepository.findOneOrFail({ where: { id } });
    if (!genre) {
      throw new BadRequestException(`Genre with ID ${id} not found`);
    }
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
}
