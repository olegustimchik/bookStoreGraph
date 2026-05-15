import { InputType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import { IsString } from "class-validator";
import { TimeInput } from "./time-input.request.dto";


@InputType()
export class FilterInput { 

    @Field(() => String, { nullable: true, description: 'A string to filter by genres' })
    @IsString()
    @IsOptional()
    genre?: string;

    @Field(() => TimeInput, { nullable: true, description: 'A time range to filter by publication year', name: 'publicationYear' })
    @IsOptional()
    @ValidateNested()
    @Type(() => TimeInput)
    publicationYear?: TimeInput;

}