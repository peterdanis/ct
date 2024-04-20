import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Kafka, Producer as KafkaProducer } from 'kafkajs';
import { ProducerServiceOptions } from './producer.types';

@Injectable()
export class ProducerService implements OnApplicationShutdown {
  private readonly kafkas: Map<string, Kafka> = new Map();
  private readonly producers: KafkaProducer[] = [];

  /**
   * **Warning!** Will block service startup if this function is awaited
   * in onModuleInit method and Kafka is not available.
   *
   * Limitation: supports only one subscription per subscriber
   *
   * *Usage*:
   *
   * const consumer = await createConsumer(options);
   *
   * await consumer.subscribe(topic, onMessageFn)
   */
  async createProducer(
    options: ProducerServiceOptions
  ): Promise<KafkaProducer> {
    const { kafkaConfig, producerConfig } = options;
    const { brokers } = kafkaConfig;
    const key = `${brokers.join(';')}`;
    const logger = new Logger(`KafkaProducer:${key}`);

    let kafka = this.kafkas.get(key);
    if (!kafka) {
      kafka = new Kafka({ brokers });
    }
    const producer = kafka.producer(producerConfig);

    producer.on('producer.connect', () => {
      logger.log('Producer connected');
    });

    await producer.connect();
    this.producers.push(producer);

    return producer;
  }

  async onApplicationShutdown() {
    for (const producer of this.producers) {
      await producer.disconnect();
    }
  }
}
