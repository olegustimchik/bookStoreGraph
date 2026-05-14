import { ArgsType, Field } from "@nestjs/graphql";
import { IsDate, IsOptional, IsString } from "class-validator";
import { PaginationArgs } from "../../../../common/base/dto/pagination-args.dto";

@ArgsType()
export class GetAuthorsArgs extends PaginationArgs {
    @Field(() => String, { nullable: true, description: 'A string to search author by full name' })
    @IsOptional()
    @IsString()
    query?: string;

    @Field(() => Date, { nullable: true, description: 'Filter authors born from this date' })
    @IsOptional()
    @IsDate()
    from?: Date;

    @Field(() => Date, { nullable: true, description: 'Filter authors born up to this date' })
    @IsOptional()
    @IsDate()
    to?: Date;
}
