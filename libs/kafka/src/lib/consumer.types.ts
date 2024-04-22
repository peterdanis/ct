import type { ConsumerConfig, KafkaConfig, KafkaMessage } from 'kafkajs';

export type ConsumerServiceOptions = {
  consumerConfig: ConsumerConfig;
  kafkaConfig: { brokers: string[] } & Omit<KafkaConfig, 'brokers'>;
};

export type OnMessage = (message: KafkaMessage) => Promise<void>;

export type Consumer = {
  subscribe: (
    topic: string,
    onMessage: OnMessage,
    options?: { fromBeginning: boolean; partitionsConsumedConcurrently: number }
  ) => Promise<void>;
};
