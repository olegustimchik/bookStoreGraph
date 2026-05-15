import { Test } from '@nestjs/testing';
import { GqlThrottlerGuard } from './gql-throttler.guard';
import { RateLimiterModule } from './rate-limiter.module';
import type { TestingModule } from '@nestjs/testing';

describe('RateLimiterModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [RateLimiterModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should compile the module and provide GqlThrottlerGuard', () => {
    const guard = module.get<GqlThrottlerGuard>(GqlThrottlerGuard);
    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(GqlThrottlerGuard);
  });
});
