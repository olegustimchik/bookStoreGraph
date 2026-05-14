import { ArgsType, Field } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { PaginationArgs } from "../../../../common/base/dto/pagination-args.dto";

@ArgsType()
export class GetGenresArgs extends PaginationArgs {
    @Field(() => String, { nullable: true, description: 'A string to search across all entities (case-insensitive, partial match, covered few words cases)' })
    @IsOptional()
    @IsString()
    query?: string;
}