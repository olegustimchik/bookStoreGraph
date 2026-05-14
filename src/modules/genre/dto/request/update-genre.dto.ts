import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateGenreInput {
  @Field(() => String)
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String)
  @IsUUID('4')
  id!: string;
}
