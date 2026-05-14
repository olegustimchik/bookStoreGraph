import { ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from '../../../../common/base/dto/paginated-response.dto';
import { Author } from '../../entities/author.entity';

@ObjectType()
export class PaginateAuthorsResponse extends PaginatedResponse(Author) {}
