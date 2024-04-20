import type { ConsumerConfig, KafkaConfig, KafkaMessage } from 'kafkajs';

export type ConsumerServiceOptions = {
  consumerConfig: ConsumerConfig;
  kafkaConfig: { brokers: string[] } & Omit<KafkaConfig, 'brokers'>;
};

export type Consumer = {
  subscribe: (
    topic: string,
    onMessage: (message: KafkaMessage) => Promise<void>,
    options?: { fromBeginning: boolean; partitionsConsumedConcurrently: number }
  ) => Promise<void>;
};
