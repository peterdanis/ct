import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProducerService } from '@ct/kafka';
import { ReviewModifiedAction, ReviewModifiedMessageDto } from '@ct/dto';
import { Producer } from 'kafkajs';
import { ReviewsRepository } from './reviews.repository';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { SharedService } from '../shared/shared.service';
import { ulid } from 'ulidx';

@Injectable()
export class ReviewsService implements OnModuleInit {
  private producer: Producer;
  private reviewModifiedTopic: string;

  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly producerService: ProducerService,
    private readonly sharedService: SharedService
  ) {}

  async onModuleInit() {
    const { reviewModifiedTopic, brokers } = this.sharedService.env.kafka;
    this.reviewModifiedTopic = reviewModifiedTopic;

    const kafkaConfig = { brokers };
    this.producer = await this.producerService.createProducer({ kafkaConfig });
  }

  async getAll(productId: string, paginationToken?: string) {
    return this.reviewsRepository.getAll(productId, paginationToken);
  }

  async getById(productId: string, reviewId: string) {
    return this.reviewsRepository.getById(productId, reviewId);
  }

  async create(productId: string, reviewInput: CreateReviewDto) {
    const review = await this.reviewsRepository.create(productId, reviewInput);
    const { reviewId, rating } = review;
    const reviewModifiedEvent: ReviewModifiedMessageDto = {
      id: ulid(),
      source: 'com.ct.product.product-service', // TODO: extract
      type: 'reviewModifiedEvent', // TODO: extract
      time: new Date().toISOString(),
      specversion: '1.0', // TODO: extract
      data: {
        action: ReviewModifiedAction.CREATED,
        reviewId,
        rating,
        productId,
      },
    };
    await this.producer.send({
      topic: this.reviewModifiedTopic,
      messages: [
        { key: productId, value: JSON.stringify(reviewModifiedEvent) },
      ],
    });

    return review;
  }

  async update(
    productId: string,
    reviewId: string,
    updatedReview: UpdateReviewDto
  ) {
    // TODO: return both new and old - needed for event
    return this.reviewsRepository.update(productId, reviewId, updatedReview);
  }

  async delete(productId: string, reviewId: string) {
    // TODO: check existence
    return this.reviewsRepository.delete(productId, reviewId);
  }
}
