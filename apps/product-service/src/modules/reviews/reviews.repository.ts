import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulidx';
import {
  CreateReviewDto,
  GetReviewsDto,
  ReviewDto,
  UpdateReviewDto,
} from '@ct/dto';
import { SharedService } from '../shared/shared.service';
import {
  ConditionalCheckFailedException,
  ReturnValue,
} from '@aws-sdk/client-dynamodb';

// TODO: extract to libs
@Injectable()
export class ReviewsRepository {
  private documentClient: DynamoDBDocumentClient;
  private tableName: string;
  private logger = new Logger(ReviewsRepository.name);

  constructor(private readonly sharedService: SharedService) {
    this.documentClient = this.sharedService.getDynamoDbDocumentClient();
    this.tableName = this.sharedService.config.dynamoDb.table;
  }

  getKeys(productId: string, reviewId: string): Record<string, unknown> {
    return {
      PK: `PRODUCT#${productId}`,
      SK: `#REVIEW#${reviewId}`,
    };
  }

  async create(
    productId: string,
    reviewInput: CreateReviewDto
  ): Promise<ReviewDto> {
    this.logger.log({ reviewInput }, 'create.input');
    const reviewId = ulid();
    const review = { productId, reviewId, ...reviewInput };
    const putItemCommand = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...this.getKeys(productId, reviewId),
        ...review,
      },
      Expected: {
        PK: {
          Exists: false,
        },
      },
    });
    await this.documentClient.send(putItemCommand);
    return review;
  }

  async getById(productId: string, reviewId: string): Promise<ReviewDto> {
    const getItemCommand = new GetCommand({
      TableName: this.tableName,
      Key: this.getKeys(productId, reviewId),
    });

    const { Item } = await this.documentClient.send(getItemCommand);

    if (!Item) {
      throw new NotFoundException();
    }

    return this.sharedService.validateAndStrip(Item, ReviewDto);
  }

  async getAll(
    productId: string,
    lastEvaluatedKey?: string
  ): Promise<GetReviewsDto> {
    const exclusiveStartKey = lastEvaluatedKey
      ? this.sharedService.decodeFromBase64(lastEvaluatedKey)
      : undefined;

    const key = this.getKeys(productId, '');
    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      ExclusiveStartKey: exclusiveStartKey,
      KeyConditions: {
        PK: { AttributeValueList: [key.PK], ComparisonOperator: 'EQ' },
        // include SK to exclude product item itself in query
        SK: { AttributeValueList: [key.SK], ComparisonOperator: 'BEGINS_WITH' },
      },
      // newest first - based on ULIDs being sortable
      ScanIndexForward: false,
    });

    const { Items, LastEvaluatedKey } = await this.documentClient.send(
      queryCommand
    );

    const paginationToken = LastEvaluatedKey
      ? this.sharedService.encodeToBase64(LastEvaluatedKey)
      : undefined;
    const reviews = Items.reduce(
      this.sharedService.getAllReducer(ReviewDto),
      []
    );

    return {
      reviews,
      paginationToken,
    } as GetReviewsDto;
  }

  async delete(productId: string, reviewId: string): Promise<ReviewDto> {
    const deleteCommand = new DeleteCommand({
      TableName: this.tableName,
      Key: this.getKeys(productId, reviewId),
      ReturnValues: ReturnValue.ALL_OLD,
    });

    const { Attributes } = await this.documentClient.send(deleteCommand);

    if (!Attributes) {
      throw new NotFoundException();
    }

    return this.sharedService.validateAndStrip(Attributes, ReviewDto);
  }

  async update(
    productId: string,
    reviewId: string,
    updatedReview: UpdateReviewDto,
    returnOriginalValues?: boolean
  ): Promise<ReviewDto> {
    this.logger.log({ updatedReview }, 'update.input');
    try {
      const attributeUpdates = {};
      const key = this.getKeys(productId, reviewId);
      for (const [key, value] of Object.entries(updatedReview)) {
        attributeUpdates[key] = { Value: value };
      }
      const updateItemCommand = new UpdateCommand({
        TableName: this.tableName,
        Key: key,
        AttributeUpdates: attributeUpdates,
        ReturnValues: returnOriginalValues
          ? ReturnValue.ALL_OLD
          : ReturnValue.ALL_NEW,
        Expected: {
          PK: {
            Exists: true,
            Value: key.PK,
          },
        },
      });
      const { Attributes } = await this.documentClient.send(updateItemCommand);
      return this.sharedService.validateAndStrip(Attributes, ReviewDto);
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new NotFoundException();
      }
      throw error;
    }
  }
}
