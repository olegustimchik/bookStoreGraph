import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './src/app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const config = app.get(ConfigService);
  console.log("TTL:", config.get('THROTTLE_TTL'));
  console.log("LIMIT:", config.get('THROTTLE_LIMIT'));
  process.exit(0);
}
bootstrap();
