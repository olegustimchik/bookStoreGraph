import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import { IsString } from "class-validator";
import { FilterInput } from "./filter-input.request.dto";


@InputType()
export class SearchArgs {
    @Field(() => String, { nullable: true, description: 'A string to search across all entities (case-insensitive, partial match, covered few words cases)' })
    @IsOptional()
    @IsString()
    query?: string;

    @Field(() => FilterInput, { nullable: true, description: 'Filtering options for the search' })
    @IsOptional()
    @ValidateNested()
    @Type(() => FilterInput) 
    filter?: FilterInput;
} 