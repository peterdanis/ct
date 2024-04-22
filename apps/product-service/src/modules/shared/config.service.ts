import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  dynamoDb = {
    endpoint: process.env.DYNAMODB_ENDPOINT,
    table: process.env.DYNAMODB_TABLE,
  };

  kafka = {
    brokers: process.env.KAFKA_BOOTSTRAP_SERVERS.split(','),
    ratingCalculatedTopic: process.env.KAFKA_RATING_CALCULATED_TOPIC,
    reviewModifiedTopic: process.env.KAFKA_REVIEW_MODIFIED_TOPIC,
    groupId: process.env.KAFKA_GROUP_ID,
    fromBeginning:
      process.env.KAFKA_START_FROM_BEGINNING === 'true' ? true : false,
    partitionsConsumedConcurrently: parseInt(
      process.env.KAFKA_PARTITIONS_CONSUMED_CONCURRENTLY,
      10
    ),
    source: 'product/product-service',
  };

  redis = {
    ttl: parseInt(process.env.REDIS_TTL),
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    },
  };
}
