import { Injectable } from '@nestjs/common';
import { productMock } from '../../../tests/product.mocks';
import { ProductDto } from './dto/product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-products.dto';

@Injectable()
export class ProductsService {
  async getAll(paginationToken?: string): Promise<GetProductsDto> {
    return { products: [productMock] };
  }

  async getOne(id: string): Promise<ProductDto> {
    return productMock;
  }

  async create(product: CreateProductDto): Promise<void> {}

  async update(id: string): Promise<void> {}

  async delete(id: string): Promise<void> {}
}
