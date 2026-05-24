import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductImageDto: CreateProductImageDto) {
    await this.ensureProductExists(createProductImageDto.productId);
    return this.prisma.productImage.create({
      data: createProductImageDto,
      include: { product: true },
    });
  }

  findAll(productId?: string) {
    return this.prisma.productImage.findMany({
      where: productId ? { productId } : undefined,
      include: { product: true },
    });
  }

  async findOne(id: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!image) {
      throw new NotFoundException(`Product image with id "${id}" not found`);
    }
    return image;
  }

  async update(id: string, updateProductImageDto: UpdateProductImageDto) {
    await this.findOne(id);
    return this.prisma.productImage.update({
      where: { id },
      data: updateProductImageDto,
      include: { product: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.productImage.delete({ where: { id } });
  }

  private async ensureProductExists(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" not found`);
    }
  }
}
