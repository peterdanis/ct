import type { Logger } from '@nestjs/common';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ClassConstructor } from 'class-transformer';

export type DynamoDbClient = {
  table: string;
  documentClient: DynamoDBDocumentClient;
  logger: Logger;
};

export type DynamoDbClientActionsInput<T> = {
  dynamoDbClient: DynamoDbClient;
  getKeys: (pk: string, sk?: string) => Record<string, unknown>;
  dto: ClassConstructor<T>;
  pk: string;
  sk?: string;
};
export type DynamoDbClientScanItemsInput<T> = Pick<
  DynamoDbClientActionsInput<T>,
  'dynamoDbClient' | 'dto'
> & {
  paginationToken?: string;
};

export type DynamoDbClientQueryItemsInput<T> = DynamoDbClientActionsInput<T> & {
  paginationToken?: string;
  inDescendingOrder?: boolean;
};

export type DynamoDbClientScanAndQueryItemsOutput<T> = {
  items: T[];
  paginationToken?: string;
};

export type DynamoDbClientCreateItemInput<T> = Pick<
  DynamoDbClientActionsInput<T>,
  'dynamoDbClient' | 'dto' | 'pk' | 'getKeys'
> & {
  item: T;
};

export type DynamoDbClientUpdateItemInput<T> = DynamoDbClientActionsInput<T> & {
  item: Partial<T>;
  returnOriginalValues?: boolean;
};
