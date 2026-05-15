import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional } from 'class-validator';

@InputType()
export class TimeInput {
    @Field(() => Int, { nullable: true, description: 'A number to filter by publication year' })
    @IsInt()
    @IsOptional()
    from?: number;

    @Field(() => Int, { nullable: true, description: 'A number to filter by publication year' }) 
    @IsInt()
    @IsOptional()
    to?: number;
}