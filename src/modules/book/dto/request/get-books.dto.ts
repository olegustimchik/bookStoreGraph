import { ArgsType, Field } from "@nestjs/graphql";
import { IsDate, IsOptional, IsString, IsUUID } from "class-validator";
import { PaginationArgs } from "../../../../common/base/dto/pagination-args.dto";

@ArgsType()
export class GetBooksArgs extends PaginationArgs {
    @Field(() => String, { nullable: true, description: 'A string to search book by title' })
    @IsOptional()
    @IsString()
    query?: string;

    @Field(() => String, { nullable: true, description: 'Filter books by genre ID' })
    @IsOptional()
    @IsUUID('4')
    genreId?: string;

    @Field(() => Date, { nullable: true, description: 'Filter books published from this date' })
    @IsOptional()
    @IsDate()
    from?: Date;

    @Field(() => Date, { nullable: true, description: 'Filter books published up to this date' })
    @IsOptional()
    @IsDate()
    to?: Date;
}
