import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { GqlThrottlerGuard } from './gql-throttler.guard';
import { ConfigurationModule } from '../../configuration/config.module';

@Module({
  imports: [
    ConfigurationModule,
    ThrottlerModule.forRootAsync({  
        inject: [ConfigService], 
        useFactory: (configService: ConfigService): ThrottlerModuleOptions => { 
            return { 
                errorMessage: 'Too many requests, please try again later.',
                throttlers:[ { ttl: Number(configService.get('THROTTLE_TTL')), limit: Number(configService.get('THROTTLE_LIMIT')) } ] 
        };  }
    }),
  ],
  providers: [GqlThrottlerGuard],
  exports: [GqlThrottlerGuard],
})
export class RateLimiterModule {}