import { InputType, Field } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateAuthorInput {
  @Field(() => String, { description: 'Full name of the author' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @Field(() => Date, { description: 'Date of birth of the author' })
  @IsDate()
  dateOfBirth!: Date;

  @Field(() => Date, { nullable: true, description: 'Date of death of the author' })
  @IsDate()
  @IsOptional()
  dateOfDeath?: Date;
}
