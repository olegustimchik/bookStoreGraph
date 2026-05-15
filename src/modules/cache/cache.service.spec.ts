import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { CacheService } from './cache.service';
import type { TestingModule } from '@nestjs/testing';
import type { Redis } from 'ioredis';

jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => {
      return {
        on: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
      };
    }),
  };
});

describe('CacheService', () => {
  let service: CacheService;
  let redisClient: jest.Mocked<Redis>;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockImplementation((key, defaultValue) => {
        if (key === 'REDIS_TTL') return 3600;
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    redisClient = (service as unknown as { redisClient: jest.Mocked<Redis> }).redisClient;
    loggerErrorSpy = jest.spyOn((service as unknown as { logger: { error: jest.Mock } }).logger, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should log an error when redis emits an error', () => {
      const onSpy = jest.spyOn(redisClient, 'on');
      const errorCallback = onSpy.mock.calls.find((call) => call[0] === 'error')?.[1] as unknown as (err: Error) => void;
      expect(errorCallback).toBeDefined();

      const testError = new Error('Test Redis Connection Error');
      errorCallback(testError);

      expect(loggerErrorSpy).toHaveBeenCalledWith(`Redis connection error: ${testError.message}`);
    });
  });

  describe('generateHashKey', () => {
    it('should generate a consistent hash key', () => {
      const key1 = service.generateHashKey('test', { a: 1 });
      const key2 = service.generateHashKey('test', { a: 1 });
      const key3 = service.generateHashKey('test2', { a: 1 });

      expect(key1).toEqual(key2);
      expect(key1).not.toEqual(key3);
      expect(key1.startsWith('test:')).toBe(true);
    });
  });

  describe('get', () => {
    it('should return null if key does not exist', async () => {
      const getSpy = jest.spyOn(redisClient, 'get').mockResolvedValue(null);
      
      const result = await service.get('missing-key');
      expect(result).toBeNull();
      expect(getSpy).toHaveBeenCalledWith('missing-key');
    });

    it('should return parsed JSON if key exists', async () => {
      const data = { foo: 'bar', age: 25 };
      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify(data));
      
      const result = await service.get('existing-key');
      expect(result).toEqual(data);
    });

    it('should parse dates properly from stringified JSON', async () => {
      const dateStr = '2023-01-01T00:00:00.000Z';
      const data = { dateField: dateStr };
      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify(data));
      
      const result = await service.get<{ dateField: Date }>('date-key');
       
      expect(result!.dateField).toBeInstanceOf(Date);
       
      expect(result!.dateField.toISOString()).toEqual(dateStr);
    });

    it('should handle redis errors gracefully and return null', async () => {
      jest.spyOn(redisClient, 'get').mockRejectedValue(new Error('Redis get failed'));
      
      const result = await service.get('error-key');
      expect(result).toBeNull();
      expect(loggerErrorSpy).toHaveBeenCalledWith('Error getting cache key error-key: Redis get failed');
    });

    it('should handle non-Error throwables gracefully', async () => {
      jest.spyOn(redisClient, 'get').mockRejectedValue('String Error Message');
      
      const result = await service.get('error-key-2');
      expect(result).toBeNull();
      // Should not log `.message` since it's not an instance of Error
    });
  });

  describe('set', () => {
    it('should store value with default TTL', async () => {
      const data = { test: true };
      const setSpy = jest.spyOn(redisClient, 'set');
      
      await service.set('set-key', data);
      
      expect(setSpy).toHaveBeenCalledWith(
        'set-key',
        JSON.stringify(data),
        'EX',
        3600 // Taken from mocked config service
      );
    });

    it('should store value with custom TTL', async () => {
      const data = { test: false };
      const setSpy = jest.spyOn(redisClient, 'set');
      
      await service.set('set-key-custom', data, 120);
      
      expect(setSpy).toHaveBeenCalledWith(
        'set-key-custom',
        JSON.stringify(data),
        'EX',
        120
      );
    });

    it('should handle redis errors gracefully', async () => {
      jest.spyOn(redisClient, 'set').mockRejectedValue(new Error('Redis set failed'));
      
      await service.set('set-error-key', { a: 1 });
      expect(loggerErrorSpy).toHaveBeenCalledWith('Error setting cache key set-error-key: Redis set failed');
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      const delSpy = jest.spyOn(redisClient, 'del');
      await service.del('del-key');
      expect(delSpy).toHaveBeenCalledWith('del-key');
    });

    it('should handle redis errors gracefully', async () => {
      jest.spyOn(redisClient, 'del').mockRejectedValue(new Error('Redis del failed'));
      
      await service.del('del-error-key');
      expect(loggerErrorSpy).toHaveBeenCalledWith('Error deleting cache key del-error-key: Redis del failed');
    });
  });
});
