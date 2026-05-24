import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SeedProductsDto } from './dto/seed-products.dto';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('products')
  @HttpCode(HttpStatus.ACCEPTED)
  seedProducts(@Body() dto: SeedProductsDto) {
    return this.seedService.startSeed(
      dto.count ?? 1_000_000,
      dto.categoryCount ?? 100,
      dto.clearExisting ?? false,
    );
  }

  @Get('status')
  getStatus() {
    return this.seedService.getStatus();
  }
}
