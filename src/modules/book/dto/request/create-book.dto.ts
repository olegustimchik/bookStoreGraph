import { InputType, Field } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsString, IsUUID, IsArray, IsOptional } from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field(() => String, { description: 'Title of the book' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field(() => Date, { description: 'Publication date of the book' })
  @IsDate()
  publicationDate!: Date;

  @Field(() => String, { description: 'Author ID' })
  @IsUUID('4')
  @IsNotEmpty()
  authorId!: string;

  @Field(() => [String], { nullable: true, description: 'List of Genre IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  genreIds?: string[];
}
