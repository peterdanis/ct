import type { KafkaConfig, ProducerConfig } from 'kafkajs';

export type ProducerServiceOptions = {
  kafkaConfig: { brokers: string[] } & Omit<KafkaConfig, 'brokers'>;
  producerConfig?: ProducerConfig;
};

export type Producer = {
  produce: (topic: string, message: string) => Promise<void>;
};
