import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { GqlThrottlerGuard } from '../rate-limiting/gql-throttler.guard';
import { SearchArgs } from './dto/request/search-input.request.dto';
import { SearchResponse } from './dto/response/search.response.dto';
import { SearchService } from './search.service';

@Resolver()
@UseGuards(GqlThrottlerGuard)
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query(() => SearchResponse, { name: 'search' })
  async search(@Args('search') search: SearchArgs): Promise<SearchResponse> {
    return this.searchService.search(search);
  }
}
