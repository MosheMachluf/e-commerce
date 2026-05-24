import { Module } from '@nestjs/common';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesNestedController } from './product-images-nested.controller';
import { ProductImagesService } from './product-images.service';

@Module({
  controllers: [ProductImagesController, ProductImagesNestedController],
  providers: [ProductImagesService],
})
export class ProductImagesModule {}
