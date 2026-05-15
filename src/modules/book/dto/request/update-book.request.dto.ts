import { InputType, Field } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

@InputType()
export class UpdateBookInput {
  @Field(() => String)
  @IsUUID('4')
  id!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  publicationDate?: Date;

  @Field(() => String, { nullable: true })
  @IsUUID('4')
  @IsOptional()
  authorId?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  genreIds?: string[];
}
