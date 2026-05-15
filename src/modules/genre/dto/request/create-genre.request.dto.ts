import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateGenreInput {
  @Field(() => String, { description: 'Name of the genre' })
  @IsString()
  name!: string;
}
