import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port, '0.0.0.0');

  Logger.log(`Application is running on http://0.0.0.0:${port}`, 'Bootstrap');
  Logger.log(`GraphiQL is available at http://0.0.0.0:${port}/graphiql`, 'Bootstrap');
}

void bootstrap();
