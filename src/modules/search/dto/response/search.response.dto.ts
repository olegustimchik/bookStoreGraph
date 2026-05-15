import { Field, ObjectType } from "@nestjs/graphql";
import { CountedAuthorResponse } from "../../../author/dto/response/counted-author.response.dto";
import { CountedBookResponse } from "../../../book/dto/response/counted-book.response.dto";
import { CountedGenreResponse } from "../../../genre/dto/response/counted-genre.response.dto";


@ObjectType()
export class SearchResponse {
    @Field(() => CountedBookResponse, { nullable: true })
    books?: CountedBookResponse;

    @Field(() => CountedGenreResponse, { nullable: true })
    genres?: CountedGenreResponse;

   @Field(() => CountedAuthorResponse, { nullable: true })
   authors?: CountedAuthorResponse;
} 