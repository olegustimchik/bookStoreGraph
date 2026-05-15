import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerStorageService } from '@nestjs/throttler';
import { GqlThrottlerGuard } from './gql-throttler.guard';
import type { ExecutionContext } from '@nestjs/common';

jest.mock('@nestjs/graphql', () => ({
  ...jest.requireActual('@nestjs/graphql'),
  GqlExecutionContext: {
    create: () => jest.fn(),
  },
}));

describe('GqlThrottlerGuard', () => {
  let guard: GqlThrottlerGuard;

  beforeEach(() => {
    // We dummy mock the dependencies required by ThrottlerGuard base class
    const options = {
      throttlers: [{ ttl: 60, limit: 10 }]
    };
    const storageService = new ThrottlerStorageService();
    const reflector = new Reflector();

    guard = new GqlThrottlerGuard(options, storageService, reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRequestResponse', () => {
    it('should extract req and res from GqlExecutionContext', () => {
      const mockReq = { headers: {} };
      const mockRes = { setHeader: jest.fn() };

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({
          req: mockReq,
          res: mockRes,
        }),
      };

      const createSpy = jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as unknown as GqlExecutionContext);

      const mockExecutionContext = {} as unknown as ExecutionContext;

      const result = guard.getRequestResponse(mockExecutionContext);

      expect(createSpy).toHaveBeenCalledWith(mockExecutionContext);
      expect(mockGqlContext.getContext).toHaveBeenCalled();
      expect(result).toEqual({ req: mockReq, res: mockRes });
    });
  });
});
