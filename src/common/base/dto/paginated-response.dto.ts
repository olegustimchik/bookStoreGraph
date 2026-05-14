import { Type } from '@nestjs/common';
import { Field, ObjectType, Int } from '@nestjs/graphql';

export function PaginatedResponse<T>(classRef: Type<T>): any {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [classRef], { nullable: true })
    data!: T[];

    @Field(() => Int)
    totalCount!: number;

    @Field(() => Boolean)
    hasNextPage!: boolean;
  }
  return PaginatedType;
}