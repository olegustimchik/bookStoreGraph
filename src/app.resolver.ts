import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String, {
    description: 'Simple GraphQL query to verify that the API is up.',
  })
  healthCheck(): string {
    return 'bookStoreGraph GraphQL is running';
  }
}
