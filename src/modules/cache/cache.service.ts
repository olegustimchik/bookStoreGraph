import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private readonly redisClient: Redis;
  private readonly logger = new Logger(CacheService.name);

  constructor(private configService: ConfigService) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', ''),
      db: this.configService.get<number>('REDIS_DB', 0),
    });

    this.redisClient.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });
  }

  generateHashKey<T>(prefix: string, data: T): string {
    const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    return `${prefix}:${hash}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      
      const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
      return JSON.parse(data, (key, value) => {
        if (typeof value === 'string' && dateFormat.test(value)) {
          return new Date(value);
        }
        return value;
      });
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`Error getting cache key ${key}: ${err.message}`);
      }
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds || Number(this.configService.get<number>('REDIS_TTL', 3600));
      await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) { 
        if (err instanceof Error) { 
            this.logger.error(`Error setting cache key ${key}: ${err.message}`);
        }
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`Error deleting cache key ${key}: ${err.message}`);
      }
    }
  }
}