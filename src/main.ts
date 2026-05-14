import 'reflect-metadata';

import fastifyCookie from '@fastify/cookie';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters/all-exeption.filter';
import { WinstonLogger } from './common/logger/logger';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

const createValidationPipe = (): ValidationPipe => {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  });
};

const setupCors = (app: NestFastifyApplication): void => {
  const configService = app.get(ConfigService);

  const origins = configService.get('ORIGINS');
  const methods = configService.get('METHODS');

  app.enableCors({ origin: origins, methods });
};

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const winstonLogger = app.get(WinstonLogger);
  const configService = app.get(ConfigService);

  const port = Number(configService.get<number>('SERVER_PORT', 3000));

  app.useGlobalPipes(createValidationPipe());
  app.useLogger(winstonLogger);
  app.useGlobalFilters(new AllExceptionFilter(winstonLogger));

  await app.register(fastifyCookie, { secret: configService.get<string>('COOKIE_SECRET', 'default-secret') });

  setupCors(app);

  await app.listen(port, '0.0.0.0');

  Logger.log(`Application is running on http://0.0.0.0:${port}`, 'Bootstrap');
  Logger.log(`GraphiQL is available at http://0.0.0.0:${port}/graphiql`, 'Bootstrap');
}

void bootstrap();
