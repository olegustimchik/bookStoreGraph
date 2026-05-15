import { ObjectType, PickType } from "@nestjs/graphql";
import { PaginateAuthorsResponse } from "./paginate-authors.response.dto";

@ObjectType()
export class CountedAuthorResponse extends PickType(PaginateAuthorsResponse, ['totalCount', 'data'] as const) {}