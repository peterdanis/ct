import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { KafkaMessage } from 'kafkajs';
import { KafkaConsumer, KafkaConsumerOptions } from './kafka-consumer';

type ConsumerOptions = KafkaConsumerOptions & {
  onMessage: (message: KafkaMessage) => Promise<void>;
};

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly consumers: KafkaConsumer[] = [];

  async consume(options: ConsumerOptions) {
    const { onMessage, ...otherOptions } = options;
    const consumer = new KafkaConsumer(otherOptions);
    await consumer.connect();
    await consumer.consume(onMessage);
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
