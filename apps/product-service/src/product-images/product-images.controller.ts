import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { ProductImagesService } from './product-images.service';

@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post()
  create(@Body() createProductImageDto: CreateProductImageDto) {
    return this.productImagesService.create(createProductImageDto);
  }

  @Get()
  findAll(@Query('productId', new ParseUUIDPipe({ optional: true })) productId?: string) {
    return this.productImagesService.findAll(productId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productImagesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductImageDto: UpdateProductImageDto,
  ) {
    return this.productImagesService.update(id, updateProductImageDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productImagesService.remove(id);
  }
}
