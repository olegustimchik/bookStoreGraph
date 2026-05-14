import { BadRequestException, Injectable } from '@nestjs/common';
import { ILike, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AuthorRepository } from './author.repository';
import { CreateAuthorInput } from './dto/request/create-author.dto';
import { GetAuthorsArgs } from './dto/request/get-authors.dto';
import { UpdateAuthorInput } from './dto/request/update-author.dto';
import { PaginateAuthorsResponse } from './dto/response/paginate-authors.response.dto';
import { Author } from './entities/author.entity';
import { BaseService } from '../../common/base/base.service';

@Injectable()
export class AuthorService extends BaseService<Author> {
  constructor(
    private readonly authorRepository: AuthorRepository,
  ) {
    super(authorRepository);
  }

  async create(createAuthorInput: CreateAuthorInput): Promise<Author> {
    return this.authorRepository.create(createAuthorInput);
  }

  async findAuthors(getAuthorsArgs: GetAuthorsArgs): Promise<PaginateAuthorsResponse> {
    const where: any = {};
    if (getAuthorsArgs.query) {
      where.fullName = ILike(`%${getAuthorsArgs.query.trim().replace(/\s+/g, '%')}%`);
    }
    
    if (getAuthorsArgs.from && getAuthorsArgs.to) {
      where.dateOfBirth = Between(getAuthorsArgs.from, getAuthorsArgs.to);
    } else if (getAuthorsArgs.from) {
      where.dateOfBirth = MoreThanOrEqual(getAuthorsArgs.from);
    } else if (getAuthorsArgs.to) {
      where.dateOfBirth = LessThanOrEqual(getAuthorsArgs.to);
    }
    
    const [authors, totalCount] = await this.authorRepository.findAndCount({ where, skip: getAuthorsArgs.offset, take: getAuthorsArgs.limit });
    
    return {
      data: authors,
      totalCount,
      hasNextPage: getAuthorsArgs.offset + getAuthorsArgs.limit < totalCount,
    };
  }

  async findAuthor(id: string): Promise<Author> {
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      throw new BadRequestException(`Author with ID ${id} not found`);
    }
    return author;
  }

  async updateAuthor(updateAuthorInput: UpdateAuthorInput): Promise<Author> {
    const author = await this.findAuthor(updateAuthorInput.id);
    if (!author) {
      throw new BadRequestException(`Author with ID ${updateAuthorInput.id} not found`);
    }

    const updatedAuthor = await this.authorRepository.update({ ...author, ...updateAuthorInput });
    return updatedAuthor;
  }

  async remove(id: string): Promise<Author> {
    const author = await this.authorRepository.delete({ id });
    return author;
  }
}
