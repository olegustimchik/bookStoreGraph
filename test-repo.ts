import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { GenreService } from './src/modules/genre/genre.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const svc = app.get(GenreService);
  
  try {
    const result = await svc.findGenres({ offset: 0, limit: 10 });
    console.log("FIND ALL RESULT:::", result, Array.isArray(result));
  } catch (e) {
    console.error(e);
  }
  await app.close();
}
bootstrap();
