import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { BaseRepository } from '../../common/base/base.repository';

@Injectable()
export class BookRepository extends BaseRepository<Book> {
  constructor(@InjectRepository(Book) bookRepository: Repository<Book>) {
    super(bookRepository);
  }
}
