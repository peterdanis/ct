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

  // TODO: deleting a product currently does not delete all its reviews
  // 1. query by pk
  // 2. use batchWrite to delete (max 25 items per iteration)
  async delete(productId: string) {
    await this.productsRepository.delete(productId);
  }
}
