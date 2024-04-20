import { ConsumerService } from '@ct/kafka';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SharedService } from '../shared/shared.service';
import { KafkaMessage } from 'kafkajs';

// TODO: move to service
@Injectable()
export class ReviewProcessingService implements OnModuleInit {
  private logger = new Logger(ReviewProcessingService.name);

  constructor(
    private readonly consumerService: ConsumerService,
    private readonly sharedService: SharedService
  ) {}

  async processMessage(message: KafkaMessage) {}

  async onModuleInit() {
    const { ratingCalculatedTopic, brokers, groupId } =
      this.sharedService.env.kafka;

    const consumerConfig = {
      groupId,
    };
    const kafkaConfig = { brokers };

    const consumer = await this.consumerService.createConsumer({
      kafkaConfig,
      consumerConfig,
    });

    await consumer.subscribe(ratingCalculatedTopic, this.processMessage);
  }
}
