import { InputType, Field } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateAuthorInput {
  @Field(() => String)
  @IsUUID('4')
  id!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  fullName?: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  dateOfBirth?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  dateOfDeath?: Date;
}
