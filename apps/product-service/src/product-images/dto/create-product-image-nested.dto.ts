import { IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class CreateProductImageNestedDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}
