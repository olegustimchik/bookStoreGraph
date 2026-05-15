import { ObjectType, PickType } from "@nestjs/graphql";
import { PaginateBooksResponse } from "./paginate-books.response.dto";


@ObjectType()
export class CountedBookResponse extends PickType(PaginateBooksResponse, ['totalCount', 'data'] as const) {}