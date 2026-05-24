import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export const SEED_PRODUCT_PREFIX = 'Seed Product ';
export const SEED_CATEGORY_PREFIX = 'Seed Category ';

export class SeedProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  count?: number = 1_000_000;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  categoryCount?: number = 100;

  @IsOptional()
  @IsBoolean()
  clearExisting?: boolean = false;
}
