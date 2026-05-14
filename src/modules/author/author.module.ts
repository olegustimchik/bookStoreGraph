import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorRepository } from './author.repository';
import { AuthorResolver } from './author.resolver';
import { AuthorService } from './author.service';
import { Author } from './entities/author.entity';
import { RateLimiterModule } from '../rate-limiting/rate-limiter.module';

@Module({
  imports: [TypeOrmModule.forFeature([Author]), RateLimiterModule],
  providers: [AuthorResolver, AuthorService, AuthorRepository], 
  exports: [AuthorService, AuthorRepository],
})
export class AuthorModule {}

