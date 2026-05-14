import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [CacheModule.register()],
  providers: [CacheService],
  exports: [CacheService, CacheModule],
})
export class AppCacheModule {}