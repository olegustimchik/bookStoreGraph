import { ArgsType, Field } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { PaginationArgs } from "../../../../common/base/dto/pagination-args.dto";

@ArgsType()
export class GetGenresArgs extends PaginationArgs {
    @Field(() => String, { nullable: true, description: 'A string to search genres by name' })
    @IsOptional()
    @IsString()
    query?: string;
}