import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  private readonly baseUrl =
    process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:3002';

  constructor(private readonly http: HttpService) {}

  create(createProductDto: CreateProductDto) {
    return this.request('POST', '/products', createProductDto);
  }

  findAll() {
    return this.request('GET', '/products');
  }

  findOne(id: string) {
    return this.request('GET', `/products/${id}`);
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.request('PATCH', `/products/${id}`, updateProductDto);
  }

  remove(id: string) {
    return this.request('DELETE', `/products/${id}`);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    data?: unknown,
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.request<T>({
          method,
          url: `${this.baseUrl}${path}`,
          data,
        }),
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(
          error.response.data ?? error.message,
          error.response.status,
        );
      }
      throw error;
    }
  }
}
