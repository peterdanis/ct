import type {
  KafkaConfig,
  ProducerConfig,
  ProducerRecord,
  Producer as KafkaProducer,
  Message as KafkaMessage,
} from 'kafkajs';
import { ProducerService } from './producer.service';

export type ProducerServiceOptions = {
  kafkaConfig: { brokers: string[] } & Omit<KafkaConfig, 'brokers'>;
  producerConfig?: ProducerConfig;
  recordConfig?: Omit<ProducerRecord, 'topic' | 'messages'>;
};

type Message = Omit<KafkaMessage, 'value'> & {
  event: ReturnType<ProducerService['createEvent']>;
};

export type Producer = {
  send: (
    topic: string,
    messages: Message[]
  ) => ReturnType<KafkaProducer['send']>;
};
