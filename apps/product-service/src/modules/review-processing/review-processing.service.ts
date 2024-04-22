import { ConsumerService } from '@ct/kafka';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../shared/config.service';
import { KafkaMessage } from 'kafkajs';
import { ProductsRepository } from '../shared/products.repository';
import { RatingCalculatedData, RatingCalculatedMessageDto } from '@ct/dto';
import { validateAndStrip } from '@ct/utils';

@Injectable()
export class ReviewProcessingService implements OnModuleInit {
  private logger = new Logger(ReviewProcessingService.name);

  constructor(
    private readonly consumerService: ConsumerService,
    private readonly configService: ConfigService,
    private readonly productsRepository: ProductsRepository
  ) {}

  async onModuleInit() {
    const { ratingCalculatedTopic, brokers, groupId } =
      this.configService.kafka;

    const consumerConfig = {
      groupId,
    };
    const kafkaConfig = { brokers };

    const consumer = await this.consumerService.createConsumer({
      kafkaConfig,
      consumerConfig,
    });

    await consumer.subscribe(
      ratingCalculatedTopic,
      this.processMessage.bind(this)
    );
  }

  private async processMessage(message: KafkaMessage) {
    const { value } = message;
    const parsedValue = JSON.parse(value.toString());
    let data: RatingCalculatedData;

    try {
      const validatedMessage = validateAndStrip(
        parsedValue,
        RatingCalculatedMessageDto,
        this.logger
      );
      data = validatedMessage.data;
    } catch (error) {
      this.logger.warn(error, 'Incoming message did not pass validation');
      return;
    }

    const { productId, averageRating } = data;

    await this.productsRepository.update(productId, { averageRating });
  }
}
