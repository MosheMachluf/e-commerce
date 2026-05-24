import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { resolve } from 'path';
import { ProductServiceModule } from './product-service.module';

config({ path: resolve(process.cwd(), 'apps/product-service/.env') });

async function bootstrap() {
  const app = await NestFactory.create(ProductServiceModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
