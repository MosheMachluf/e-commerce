import {
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  SEED_CATEGORY_PREFIX,
  SEED_PRODUCT_PREFIX,
} from './dto/seed-products.dto';

const BATCH_SIZE = 10_000;

export type SeedStatus = {
  running: boolean;
  phase: 'idle' | 'clearing' | 'categories' | 'products' | 'completed' | 'failed';
  productCount: number;
  categoryCount: number;
  productsInserted: number;
  categoriesInserted: number;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  error: string | null;
};

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);
  private running = false;
  private status: SeedStatus = this.initialStatus();

  constructor(private readonly prisma: PrismaService) {}

  getStatus(): SeedStatus {
    return { ...this.status };
  }

  startSeed(productCount: number, categoryCount: number, clearExisting: boolean) {
    if (this.running) {
      throw new ConflictException('A seed operation is already in progress');
    }

    this.running = true;
    this.status = {
      running: true,
      phase: 'clearing',
      productCount,
      categoryCount,
      productsInserted: 0,
      categoriesInserted: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
      durationMs: null,
      error: null,
    };

    void this.runSeed(productCount, categoryCount, clearExisting);

    return {
      message: 'Seed started',
      productCount,
      categoryCount,
      statusUrl: '/seed/status',
    };
  }

  private initialStatus(): SeedStatus {
    return {
      running: false,
      phase: 'idle',
      productCount: 0,
      categoryCount: 0,
      productsInserted: 0,
      categoriesInserted: 0,
      startedAt: null,
      completedAt: null,
      durationMs: null,
      error: null,
    };
  }

  private async runSeed(
    productCount: number,
    categoryCount: number,
    clearExisting: boolean,
  ) {
    const started = Date.now();

    try {
      if (clearExisting) {
        await this.clearSeedData();
      }

      this.status.phase = 'categories';
      const categoryIds = await this.seedCategories(categoryCount);
      this.status.categoriesInserted = categoryIds.length;

      this.status.phase = 'products';
      await this.seedProducts(productCount, categoryIds);

      this.status.phase = 'completed';
      this.status.productsInserted = productCount;
      this.logger.log(
        `Seeded ${productCount} products across ${categoryIds.length} categories in ${Date.now() - started}ms`,
      );
    } catch (error) {
      this.status.phase = 'failed';
      this.status.error =
        error instanceof Error ? error.message : 'Unknown seed error';
      this.logger.error('Seed failed', error);
    } finally {
      this.running = false;
      this.status.running = false;
      this.status.completedAt = new Date().toISOString();
      this.status.durationMs = Date.now() - started;
    }
  }

  private async clearSeedData() {
    this.status.phase = 'clearing';
    await this.prisma.productImage.deleteMany({
      where: { product: { title: { startsWith: SEED_PRODUCT_PREFIX } } },
    });
    await this.prisma.product.deleteMany({
      where: { title: { startsWith: SEED_PRODUCT_PREFIX } },
    });
    await this.prisma.category.deleteMany({
      where: { name: { startsWith: SEED_CATEGORY_PREFIX } },
    });
  }

  private async seedCategories(count: number): Promise<string[]> {
    const categories = Array.from({ length: count }, (_, index) => ({
      id: randomUUID(),
      name: `${SEED_CATEGORY_PREFIX}${index}`,
    }));

    await this.prisma.category.createMany({ data: categories });

    return categories.map((category) => category.id);
  }

  private async seedProducts(productCount: number, categoryIds: string[]) {
    const categoryArrayLiteral = `ARRAY[${categoryIds.map((id) => `'${id}'::text`).join(',')}]`;
    const categoryModulo = categoryIds.length;
    const batchCount = Math.ceil(productCount / BATCH_SIZE);

    for (let batch = 0; batch < batchCount; batch++) {
      const rangeStart = batch * BATCH_SIZE + 1;
      const rangeEnd = Math.min((batch + 1) * BATCH_SIZE, productCount);

      await this.prisma.$executeRawUnsafe(`
        INSERT INTO "Product" (
          id, title, price, currency, stock, brand, "isActive", "categoryId", "createdAt", "updatedAt"
        )
        SELECT
          gen_random_uuid()::text,
          '${SEED_PRODUCT_PREFIX}' || gs.i::text,
          (10 + random() * 990)::double precision,
          'ILS',
          floor(random() * 100)::int,
          'Brand ' || (gs.i % 50)::text,
          true,
          (${categoryArrayLiteral})[1 + ((gs.i - 1) % ${categoryModulo})],
          NOW(),
          NOW()
        FROM generate_series(${rangeStart}, ${rangeEnd}) AS gs(i)
      `);

      this.status.productsInserted = rangeEnd;
      this.logger.log(`Inserted products ${rangeStart}-${rangeEnd} / ${productCount}`);
    }
  }
}
