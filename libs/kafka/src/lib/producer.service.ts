import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Kafka, Producer as KafkaProducer, Partitioners } from 'kafkajs';
import { ulid } from 'ulidx';
import {
  RatingCalculatedData,
  RatingCalculatedType,
  ReviewCreatedData,
  ReviewDeletedData,
  ReviewModifiedType,
  ReviewUpdatedData,
} from '@ct/dto';
import { Producer, ProducerServiceOptions } from './producer.types';

@Injectable()
export class ProducerService implements OnApplicationShutdown {
  private readonly kafkas: Map<string, Kafka> = new Map();
  private readonly producers: KafkaProducer[] = [];
  private readonly logger = new Logger(ProducerService.name);

  /**
   * **Warning!** Will block service startup if this function is awaited
   * in onModuleInit method and Kafka is not available.
   *
   * Limitation: supports only one subscription per subscriber
   *
   * *Usage*:
   *
   * const producer = await createProducer(options);
   *
   * await producer.send(topic, onMessageFn)
   */
  async createProducer(options: ProducerServiceOptions): Promise<Producer> {
    const { kafkaConfig, producerConfig, recordConfig } = options;
    const { brokers } = kafkaConfig;
    const key = `${brokers.join(';')}`;

    let kafka = this.kafkas.get(key);
    if (!kafka) {
      kafka = new Kafka({ brokers });
    }
    const producer = kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
      ...producerConfig,
    });

    producer.on('producer.connect', () => {
      this.logger.log('Producer connected');
    });

    await producer.connect();
    this.producers.push(producer);

    return this.createCustomProducer(producer, recordConfig);
  }

  private createCustomProducer(
    producer: KafkaProducer,
    recordConfig: ProducerServiceOptions['recordConfig']
  ): Producer {
    return {
      send: async (topic, messages) => {
        const stringifiedMessages = messages.map(({ key, event }) => ({
          key,
          value: JSON.stringify(event),
        }));
        return producer.send({
          ...recordConfig,
          topic,
          messages: stringifiedMessages,
        });
      },
    };
  }

  // TODO: Extract to separate lib
  createReviewModifiedEvent<T extends ReviewModifiedType>(
    source: string,
    type: T,
    data: T extends ReviewModifiedType.created
      ? ReviewCreatedData
      : T extends ReviewModifiedType.updated
      ? ReviewUpdatedData
      : T extends ReviewModifiedType.deleted
      ? ReviewDeletedData
      : never
  ) {
    return {
      id: ulid(),
      source,
      type,
      time: new Date().toISOString(),
      specversion: '1.0',
      data,
    };
  }

  // TODO: Extract to separate lib
  createRatingCalculatedEvent<T extends RatingCalculatedType>(
    source: string,
    type: T,
    data: RatingCalculatedData
  ) {
    return {
      id: ulid(),
      source,
      type,
      time: new Date().toISOString(),
      specversion: '1.0',
      data,
    };
  }

  async onApplicationShutdown() {
    for (const producer of this.producers) {
      await producer.disconnect();
    }
  }
}
