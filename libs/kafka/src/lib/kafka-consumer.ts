import { Logger } from '@nestjs/common';
import { Consumer, ConsumerConfig, Kafka, KafkaMessage } from 'kafkajs';
import { setTimeout } from 'node:timers/promises';

export type KafkaConsumerOptions = {
  brokers: string[];
  topic: string;
  config: ConsumerConfig;
};

export class KafkaConsumer {
  private readonly topic: string;
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly logger: Logger;

  constructor(options: KafkaConsumerOptions) {
    const { topic, brokers, config } = options;
    console.log(brokers);
    this.topic = topic;
    this.logger = new Logger(`TopicConsumer:${topic}`);
    this.kafka = new Kafka({ brokers });
    this.consumer = this.kafka.consumer(config);

    this.consumer.on('consumer.crash', () => this.connect());
  }

  async consume(onMessage: (message: KafkaMessage) => Promise<void>) {
    try {
      await this.consumer.subscribe({
        topics: [this.topic],
        // TODO: make configurable
        fromBeginning: false,
      });
    } catch (error) {
      this.logger.error(
        'Failed to connect to subscribe to topic, retrying',
        error
      );
      await setTimeout(5000);
      await this.consume(onMessage);
      return;
    }
    await this.consumer.run({
      // TODO: make configurable
      partitionsConsumedConcurrently: 10,
      autoCommit: false,
      eachMessage: async ({ message, partition }) => {
        this.logger.debug(`Processing message partition: ${partition}`);
        try {
          await onMessage(message);
          this.consumer.commitOffsets([
            { topic: this.topic, partition, offset: message.offset + 1 },
          ]);
        } catch (error) {
          this.logger.error(error);
          throw error;
        }
      },
    });
  }

  async connect() {
    try {
      await this.consumer.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Kafka, retrying', error);
      await setTimeout(5000);
      await this.connect();
    }
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}
