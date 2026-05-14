import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppResolver } from './app.resolver';
import { WinstonLogger } from './common/logger/logger';
import { ConfigurationModule } from './configuration/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthorModule } from './modules/author/author.module';
import { BookModule } from './modules/book/book.module';
import { GenreModule } from './modules/genre/genre.module';
import { RateLimiterModule } from './modules/rate-limiting/rate-limiter.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    GraphQLModule.forRootAsync<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      inject: [ConfigService],
      useFactory: () => ({
        autoSchemaFile: 'schema.gql',
        graphiql: true,
        playground: true,
        sortSchema: true,
        context: (request: FastifyRequest, reply: FastifyReply) => ({ req: request, res: reply }),
      }),
    }),
    BookModule,
    AuthorModule,
    GenreModule,
    RateLimiterModule
  ],
  providers: [AppResolver, WinstonLogger],
})
export class AppModule {}
