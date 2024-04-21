import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsRepository } from './products.repository';
import { UpdateProductDto } from './dto/update-product.dto';

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
