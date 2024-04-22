import { Injectable, OnModuleInit } from '@nestjs/common';
import { Producer, ProducerService } from '@ct/kafka';
import { CreateReviewDto, ReviewModifiedType, UpdateReviewDto } from '@ct/dto';
import { ReviewsRepository } from '../shared/reviews.repository';
import { ConfigService } from '../shared/config.service';
import { ProductsRepository } from '../shared/products.repository';

@Injectable()
export class ReviewsService implements OnModuleInit {
  private producer: Producer;
  private reviewModifiedTopic: string;

  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly producerService: ProducerService,
    private readonly configService: ConfigService,
    private readonly productsRepository: ProductsRepository
  ) {}

  async onModuleInit() {
    const { reviewModifiedTopic, brokers } = this.configService.kafka;
    this.reviewModifiedTopic = reviewModifiedTopic;

    const kafkaConfig = { brokers };
    this.producer = await this.producerService.createProducer({ kafkaConfig });
  }

  async getAll(productId: string, paginationToken?: string) {
    // TODO: return { reviews: [] } instead of 404 to save one DB call
    await this.productsRepository.getById(productId);
    return this.reviewsRepository.getAll(productId, paginationToken);
  }

  async getById(productId: string, reviewId: string) {
    return this.reviewsRepository.getById(productId, reviewId);
  }

  async create(productId: string, reviewInput: CreateReviewDto) {
    await this.productsRepository.getById(productId);
    const review = await this.reviewsRepository.create(productId, reviewInput);

    const { reviewId, rating } = review;
    const event = this.producerService.createReviewModifiedEvent(
      this.configService.kafka.source,
      ReviewModifiedType.created,
      { productId, reviewId, newRating: rating }
    );

    // TODO: think about adding correlationId from request to event
    await this.producer.send(this.reviewModifiedTopic, [
      { key: productId, event },
    ]);

    return review;
  }

  async update(
    productId: string,
    reviewId: string,
    updatedReview: UpdateReviewDto
  ) {
    const { rating: newRating } = updatedReview;
    const isRatingUpdated = newRating !== undefined;

    const review = await this.reviewsRepository.update(
      productId,
      reviewId,
      updatedReview,
      isRatingUpdated
    );

    if (isRatingUpdated) {
      const { rating: oldRating } = review;
      const event = this.producerService.createReviewModifiedEvent(
        this.configService.kafka.source,
        ReviewModifiedType.updated,
        {
          productId,
          reviewId,
          newRating,
          oldRating,
        }
      );

      await this.producer.send(this.reviewModifiedTopic, [
        { key: productId, event },
      ]);
    }

    return { ...review, ...updatedReview };
  }

  async delete(productId: string, reviewId: string) {
    const { rating } = await this.reviewsRepository.delete(productId, reviewId);

    const event = this.producerService.createReviewModifiedEvent(
      this.configService.kafka.source,
      ReviewModifiedType.deleted,
      { productId, reviewId, oldRating: rating }
    );

    await this.producer.send(this.reviewModifiedTopic, [
      { key: productId, event },
    ]);
  }
}
