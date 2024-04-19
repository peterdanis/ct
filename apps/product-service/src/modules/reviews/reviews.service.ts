import { Injectable } from '@nestjs/common';
import { ReviewsRepository } from './reviews.repository';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async getAll(productId: string, paginationToken?: string) {
    return this.reviewsRepository.getAll(productId, paginationToken);
  }

  async getById(productId: string, reviewId: string) {
    return this.reviewsRepository.getById(productId, reviewId);
  }

  async create(productId: string, review: CreateReviewDto) {
    return this.reviewsRepository.create(productId, review);
  }

  async update(
    productId: string,
    reviewId: string,
    updatedReview: UpdateReviewDto
  ) {
    return this.reviewsRepository.update(productId, reviewId, updatedReview);
  }

  async delete(productId: string, reviewId: string) {
    return this.reviewsRepository.delete(productId, reviewId);
  }
}
