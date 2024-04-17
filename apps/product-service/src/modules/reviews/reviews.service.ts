import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewsService {
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
