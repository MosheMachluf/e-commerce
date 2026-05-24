import { IsBoolean, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateProductImageDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @IsUUID()
  productId: string;
}
