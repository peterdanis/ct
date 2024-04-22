import { NotFoundException, type Logger } from '@nestjs/common';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  ReturnValue,
} from '@aws-sdk/client-dynamodb';
import { extractFirstKey, extractSecondKey, validateAndStrip } from '@ct/utils';
import { decodeFromBase64, encodeToBase64, getAllReducer } from './utils';
import {
  DynamoDbClient,
  DynamoDbClientActionsInput,
  DynamoDbClientCreateItemInput,
  DynamoDbClientQueryItemsInput,
  DynamoDbClientScanAndQueryItemsOutput,
  DynamoDbClientScanItemsInput,
  DynamoDbClientUpdateItemInput,
} from './types';

const documentClients: Map<string, DynamoDBDocumentClient> = new Map();

export function getDynamoDbClient(
  endpoint: string,
  table: string,
  logger: Logger
): DynamoDbClient {
  const key = `${endpoint};${table}`;
  let documentClient: DynamoDBDocumentClient = documentClients.get(key);
  if (!documentClient) {
    logger.log({ key }, 'Creating new dynamoDb document client');
    const bareboneClient = new DynamoDBClient({
      endpoint,
    });
    documentClient = DynamoDBDocumentClient.from(bareboneClient, {
      marshallOptions: {
        convertClassInstanceToMap: true,
        removeUndefinedValues: true,
      },
    });
    documentClients.set(key, documentClient);
  }
  return { table, documentClient, logger };
}

export async function getById<T>(
  input: DynamoDbClientActionsInput<T>
): Promise<T> {
  const { dynamoDbClient, getKeys, dto, pk, sk } = input;
  const { table, documentClient, logger } = dynamoDbClient;
  const getItemCommand = new GetCommand({
    TableName: table,
    Key: getKeys(pk, sk),
  });

  const { Item } = await documentClient.send(getItemCommand);

  if (!Item) {
    throw new NotFoundException();
  }

  return validateAndStrip(Item, dto, logger);
}

export async function scan<T>(
  input: DynamoDbClientScanItemsInput<T>
): Promise<DynamoDbClientScanAndQueryItemsOutput<T>> {
  const { dynamoDbClient, dto, paginationToken: inputPaginationToken } = input;
  const { table, documentClient, logger } = dynamoDbClient;

  const exclusiveStartKey = inputPaginationToken
    ? decodeFromBase64(inputPaginationToken)
    : undefined;

  const scanCommand = new ScanCommand({
    TableName: table,
    ExclusiveStartKey: exclusiveStartKey,
  });

  const { Items, LastEvaluatedKey } = await documentClient.send(scanCommand);

  const paginationToken = LastEvaluatedKey
    ? encodeToBase64(LastEvaluatedKey)
    : undefined;
  const items = Items.reduce<T[]>(getAllReducer(dto, logger), []);

  return {
    items,
    paginationToken,
  };
}

export async function query<T>(
  input: DynamoDbClientQueryItemsInput<T>
): Promise<DynamoDbClientScanAndQueryItemsOutput<T>> {
  const {
    dynamoDbClient,
    dto,
    paginationToken: inputPaginationToken,
    getKeys,
    pk,
    sk,
    inDescendingOrder,
  } = input;
  const { table, documentClient, logger } = dynamoDbClient;
  const key = getKeys(pk, sk);

  const exclusiveStartKey = inputPaginationToken
    ? decodeFromBase64(inputPaginationToken)
    : undefined;

  // TODO: extract to input
  const queryCommand = new QueryCommand({
    TableName: table,
    ExclusiveStartKey: exclusiveStartKey,
    KeyConditions: {
      [extractFirstKey(key)]: {
        AttributeValueList: [key.PK],
        ComparisonOperator: 'EQ',
      },
      // include SK to exclude product item itself in query
      [extractSecondKey(key)]: {
        AttributeValueList: [key.SK],
        ComparisonOperator: 'BEGINS_WITH',
      },
    },
    // sometimes we want newest first - based on ULIDs being sortable
    ScanIndexForward: !inDescendingOrder,
  });

  const { Items, LastEvaluatedKey } = await documentClient.send(queryCommand);

  const paginationToken = LastEvaluatedKey
    ? encodeToBase64(LastEvaluatedKey)
    : undefined;
  const items = Items.reduce<T[]>(getAllReducer(dto, logger), []);

  return {
    items,
    paginationToken,
  };
}

export async function create<T>(
  input: DynamoDbClientCreateItemInput<T>
): Promise<T> {
  const { dynamoDbClient, dto, pk, item, getKeys } = input;
  const { table, documentClient, logger } = dynamoDbClient;
  logger.debug({ item }, 'dynamoDb.create input');
  const key = getKeys(pk);
  const putItemCommand = new PutCommand({
    TableName: table,
    Item: item,
    Expected: {
      [extractFirstKey(key)]: {
        Exists: false,
      },
    },
  });

  await documentClient.send(putItemCommand);

  return validateAndStrip(item, dto, logger);
}

export async function update<T>(
  input: DynamoDbClientUpdateItemInput<T>
): Promise<T> {
  const { dynamoDbClient, dto, pk, item, getKeys, sk, returnOriginalValues } =
    input;
  const { table, documentClient, logger } = dynamoDbClient;
  logger.debug({ item }, 'update.input');
  try {
    const attributeUpdates = {};
    const key = getKeys(pk, sk);
    for (const [key, value] of Object.entries(item)) {
      attributeUpdates[key] = { Value: value };
    }
    const updateItemCommand = new UpdateCommand({
      TableName: table,
      Key: key,
      AttributeUpdates: attributeUpdates,
      ReturnValues: returnOriginalValues
        ? ReturnValue.ALL_OLD
        : ReturnValue.ALL_NEW,
      Expected: {
        [extractFirstKey(key)]: {
          Exists: true,
          Value: key.PK,
        },
      },
    });

    const { Attributes } = await documentClient.send(updateItemCommand);

    return validateAndStrip(Attributes, dto, logger);
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      throw new NotFoundException();
    }
    throw error;
  }
}

export async function deleteItem<T>(
  input: DynamoDbClientActionsInput<T>
): Promise<T> {
  const { dynamoDbClient, dto, getKeys, pk, sk } = input;
  const { table, documentClient, logger } = dynamoDbClient;
  const deleteCommand = new DeleteCommand({
    TableName: table,
    Key: getKeys(pk, sk),
    ReturnValues: ReturnValue.ALL_OLD,
  });

  const { Attributes } = await documentClient.send(deleteCommand);

  if (!Attributes) {
    throw new NotFoundException();
  }

  return validateAndStrip(Attributes, dto, logger);
}
