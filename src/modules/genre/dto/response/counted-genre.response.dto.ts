import { ObjectType, PickType } from "@nestjs/graphql";
import { PaginateGenresResponse } from "./paginate-genres.response.dto";

@ObjectType()
export class CountedGenreResponse extends PickType(PaginateGenresResponse, ['totalCount', 'data'] as const) {}