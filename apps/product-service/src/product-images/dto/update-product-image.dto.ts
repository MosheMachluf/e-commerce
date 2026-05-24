import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductImageDto } from './create-product-image.dto';

export class UpdateProductImageDto extends PartialType(
  OmitType(CreateProductImageDto, ['productId'] as const),
) {}
