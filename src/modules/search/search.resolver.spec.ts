import { Test } from '@nestjs/testing';
import { SearchResolver } from './search.resolver';
import { SearchService } from './search.service';
import { GqlThrottlerGuard } from '../rate-limiting/gql-throttler.guard';
import type { SearchArgs } from './dto/request/search-input.request.dto';
import type { TestingModule } from '@nestjs/testing';

describe('SearchResolver', () => {
  let resolver: SearchResolver;
  let service: jest.Mocked<SearchService>;

  beforeEach(async () => {
    const mockSearchService = {
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchResolver,
        { provide: SearchService, useValue: mockSearchService },
      ],
    })
      .overrideGuard(GqlThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    resolver = module.get<SearchResolver>(SearchResolver);
    service = module.get(SearchService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should call SearchService.search and return the results', async () => {
    const searchArgs: SearchArgs = { query: 'test' };
    const searchResult = { books: { data: [], totalCount: 0 }, authors: { data: [], totalCount: 0 }, genres: { data: [], totalCount: 0 } };

    const searchSpy = jest.spyOn(service, 'search').mockResolvedValue(searchResult);

    const result = await resolver.search(searchArgs);

    expect(searchSpy).toHaveBeenCalledWith(searchArgs);
    expect(result).toEqual(searchResult);
  });
});
