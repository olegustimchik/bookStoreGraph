import { ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from '../../../../common/base/dto/paginated-response.dto';
import { Genre } from '../../entities/genre.entity';

@ObjectType()
export class PaginateGenresResponse extends PaginatedResponse(Genre) {}

