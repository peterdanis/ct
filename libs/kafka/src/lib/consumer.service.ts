import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { EachMessageHandler, Kafka, Consumer as KafkaConsumer } from 'kafkajs';
import { Consumer, ConsumerServiceOptions, OnMessage } from './consumer.types';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly kafkas: Map<string, Kafka> = new Map();
  private readonly consumers: KafkaConsumer[] = [];
  private readonly logger = new Logger(ConsumerService.name);

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
  async createConsumer(options: ConsumerServiceOptions): Promise<Consumer> {
    const { kafkaConfig, consumerConfig } = options;
    const { brokers } = kafkaConfig;
    const key = `${brokers.join(';')}`;

    let kafka = this.kafkas.get(key);
    if (!kafka) {
      kafka = new Kafka(kafkaConfig);
    }
    // TODO: potentially implement rackId to lower cross AZ traffic & latency
    const consumer = kafka.consumer(consumerConfig);

    consumer.on('consumer.crash', async (crashEvent) => {
      this.logger.warn(crashEvent, 'Consumer crashed, reconnecting');
      await consumer.connect();
    });

    consumer.on('consumer.connect', () => {
      this.logger.log('Consumer connected');
    });

    consumer.on('consumer.commit_offsets', (commitOffsetEvent) => {
      this.logger.debug(commitOffsetEvent, 'Committed offset');
    });

    await consumer.connect();
    this.consumers.push(consumer);

    return this.createCustomConsumer(consumer);
  }

  private createCustomConsumer(consumer: KafkaConsumer): Consumer {
    return {
      /**
       * **Warning!** Will block service startup if this function is awaited
       * in onModuleInit method and topic is not available
       */
      subscribe: async (topic, onMessage, options?) => {
        await consumer.subscribe({
          topics: [topic],
          fromBeginning: options?.fromBeginning || false,
        });
        await consumer.run({
          partitionsConsumedConcurrently:
            options?.partitionsConsumedConcurrently || 10,
          autoCommit: false,
          // TODO: add batch processing method for better performance - e.g. batching writes to DB instead of waiting for each message
          eachMessage: this.eachMessage(consumer, topic, onMessage),
        });
      },
    };
  }

  private eachMessage(
    consumer: KafkaConsumer,
    topic: string,
    onMessage: OnMessage
  ): EachMessageHandler {
    return async ({ message, partition }) => {
      this.logger.debug(
        {
          partition,
          offset: message.offset,
        },
        'Processing message'
      );
      try {
        await onMessage(message);
        const offsetToCommit = parseInt(message.offset, 10) + 1;
        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: offsetToCommit.toString(),
          },
        ]);
      } catch (error) {
        this.logger.error(error);
        throw error;
      }
    };
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
