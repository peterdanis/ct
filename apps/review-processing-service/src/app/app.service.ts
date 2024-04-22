import { ConsumerService } from '@ct/kafka';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from './config.service';
import { KafkaMessage } from 'kafkajs';
import {
  RatingCalculatedType,
  ReviewCreatedMessageDto,
  ReviewDeletedMessageDto,
  ReviewModifiedType,
  ReviewUpdatedMessageDto,
} from '@ct/dto';
import { validateAndStrip } from '@ct/utils';
import { AppRepository } from './app.repository';
import { Producer, ProducerService } from '@ct/kafka';

@Injectable()
export class AppService implements OnModuleInit {
  private logger = new Logger(AppService.name);
  private producer: Producer;
  private ratingCalculatedTopic: string;

  constructor(
    private readonly consumerService: ConsumerService,
    private readonly producerService: ProducerService,
    private readonly configService: ConfigService,
    private readonly appRepository: AppRepository
  ) {}

  async onModuleInit() {
    const { ratingCalculatedTopic, reviewModifiedTopic, brokers, groupId } =
      this.configService.kafka;

    const consumerConfig = {
      groupId,
    };
    const kafkaConfig = { brokers };

    const consumer = await this.consumerService.createConsumer({
      kafkaConfig,
      consumerConfig,
    });
    this.producer = await this.producerService.createProducer({ kafkaConfig });
    this.ratingCalculatedTopic = ratingCalculatedTopic;

    await consumer.subscribe(
      reviewModifiedTopic,
      this.processMessage.bind(this)
    );
  }

  private async processMessage(message: KafkaMessage) {
    const { value, offset } = message;
    const parsedValue = JSON.parse(value.toString());
    const type: ReviewModifiedType = parsedValue.type;
    let data;
    let validatedMessage;
    let reviewCount: -1 | 0 | 1;
    let reviewRatingSum: number;
    let newReviewCount: number;
    let newReviewRatingSum: number;

    try {
      const helper = (c) => validateAndStrip(parsedValue, c, this.logger);
      switch (type) {
        case ReviewModifiedType.created:
          validatedMessage = helper(ReviewCreatedMessageDto);
          data = validatedMessage.data;
          reviewCount = 1;
          reviewRatingSum = data.newRating;
          break;
        case ReviewModifiedType.updated:
          validatedMessage = helper(ReviewUpdatedMessageDto);
          data = validatedMessage.data;
          reviewCount = 0;
          reviewRatingSum = data.newRating - data.oldRating;
          break;
        case ReviewModifiedType.deleted:
          validatedMessage = helper(ReviewDeletedMessageDto);
          data = validatedMessage.data;
          reviewCount = -1;
          reviewRatingSum = -1 * data.oldRating;
          break;

        default:
          this.logger.warn(parsedValue, 'Incoming message has unexpected type');
          return;
      }
    } catch (error) {
      this.logger.warn(error, 'Incoming message did not pass validation');
      return;
    }

    const { productId } = data;

    try {
      const result = await this.appRepository.update(productId, {
        reviewCount,
        reviewRatingSum,
        offset: parseInt(offset, 10),
      });
      newReviewCount = result.reviewCount;
      newReviewRatingSum = result.reviewRatingSum;
    } catch (error) {
      this.logger.warn({ productId, data }, 'Old or duplicated message');
    }

    const averageRating =
      newReviewCount > 0 ? newReviewRatingSum / newReviewCount : undefined;

    const event = this.producerService.createEvent(
      this.configService.kafka.source,
      RatingCalculatedType.calculated,
      { productId, averageRating }
    );

    // TODO: think about adding correlationId from request to event
    await this.producer.send(this.ratingCalculatedTopic, [
      { key: productId, event },
    ]);
  }
}
