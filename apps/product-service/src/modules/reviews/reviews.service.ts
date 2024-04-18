import { Injectable } from '@nestjs/common';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(private readonly productRepository: ReviewsRepository) {}

  async getAll(paginationToken?: string): Promise<{ Reviews: any[] }> {
    return { Reviews: [] };
  }

  async getOne(id: string): Promise<any> {
    return 'any';
  }

  async create(review: any): Promise<void> {}

  async update(id: string): Promise<void> {}

  async delete(id: string): Promise<void> {}
}
