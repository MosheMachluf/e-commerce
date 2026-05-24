import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { ProductsModule } from './products/products.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    CategoriesModule,
    ProductImagesModule,
    SeedModule,
  ],
})
export class ProductServiceModule {}
