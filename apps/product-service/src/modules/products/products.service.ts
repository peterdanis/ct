import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductRepository } from './products.repository';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getAll(paginationToken?: string) {
    return this.productRepository.getAll(paginationToken);
  }

  async getOne(productId: string) {
    return this.productRepository.getById(productId);
  }

  async create(product: CreateProductDto) {
    return this.productRepository.create(product);
  }

  async update(productId: string, updatedProduct: UpdateProductDto) {
    return this.productRepository.update(productId, updatedProduct);
  }

  async delete(productId: string): Promise<void> {
    return this.productRepository.delete(productId);
  }
}
