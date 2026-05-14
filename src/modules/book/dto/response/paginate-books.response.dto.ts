import { ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from '../../../../common/base/dto/paginated-response.dto';
import { Book } from '../../entities/book.entity';

@ObjectType()
export class PaginateBooksResponse extends PaginatedResponse(Book) {}
