import { Injectable } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from '@ct/dto';
import { ProductsRepository } from '../shared/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async getAll(paginationToken?: string) {
    return this.productsRepository.getAll(paginationToken);
  }

  async getById(productId: string) {
    return this.productsRepository.getById(productId);
  }

  async create(product: CreateProductDto) {
    return this.productsRepository.create(product);
  }

  async update(productId: string, updatedProduct: UpdateProductDto) {
    return this.productsRepository.update(productId, updatedProduct);
  }

  async delete(productId: string) {
    await this.productsRepository.delete(productId);
  }
}
