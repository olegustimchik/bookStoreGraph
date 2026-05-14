import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { GenreRepository } from './genre.repository';
import { GenreResolver } from './genre.resolver';
import { GenreService } from './genre.service';
import { RateLimiterModule } from '../rate-limiting/rate-limiter.module';

@Module({
  imports: [TypeOrmModule.forFeature([Genre]), RateLimiterModule],
  providers: [GenreResolver, GenreService, GenreRepository],
  exports: [GenreService, GenreRepository],
})
export class GenreModule {}
