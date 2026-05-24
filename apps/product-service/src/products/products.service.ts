import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const productInclude = {
  category: true,
  images: true,
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
      include: productInclude,
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: productInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.productImage.deleteMany({ where: { productId: id } });
    return this.prisma.product.delete({ where: { id } });
  }
}
