import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateProductImageNestedDto } from './dto/create-product-image-nested.dto';
import { ProductImagesService } from './product-images.service';

@Controller('products/:productId/images')
export class ProductImagesNestedController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post()
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: CreateProductImageNestedDto,
  ) {
    return this.productImagesService.create({ ...body, productId });
  }

  @Get()
  findAll(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productImagesService.findAll(productId);
  }
}
