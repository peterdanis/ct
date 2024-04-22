import { Injectable, Logger } from '@nestjs/common';
import { ulid } from 'ulidx';
import {
  CreateReviewDto,
  GetReviewsDto,
  ReviewDto,
  UpdateReviewDto,
} from '@ct/dto';
import { ConfigService } from './config.service';
import {
  DynamoDbClient,
  DynamoDbClientActionsInput,
  create,
  deleteItem,
  getById,
  getDynamoDbClient,
  query,
  update,
} from '@ct/dynamo-db';

@Injectable()
export class ReviewsRepository {
  private dynamoDbClient: DynamoDbClient;
  private defaultOptions: Omit<DynamoDbClientActionsInput<ReviewDto>, 'pk'>;
  private tableName: string;
  private logger = new Logger(ReviewsRepository.name);

  constructor(private readonly configService: ConfigService) {
    this.tableName = this.configService.dynamoDb.table;
    const endpoint = this.configService.dynamoDb.endpoint;
    this.dynamoDbClient = getDynamoDbClient(
      endpoint,
      this.tableName,
      this.logger
    );
    this.defaultOptions = {
      dynamoDbClient: this.dynamoDbClient,
      dto: ReviewDto,
      getKeys: this.getKeys,
    };
  }

  getKeys(productId: string, reviewId: string): { PK: string; SK: string } {
    return {
      PK: `PRODUCT#${productId}`,
      SK: `#REVIEW#${reviewId}`,
    };
  }

  async create(
    productId: string,
    reviewInput: CreateReviewDto
  ): Promise<ReviewDto> {
    const reviewId = ulid();
    const item = {
      ...this.getKeys(productId, reviewId),
      productId,
      reviewId,
      ...reviewInput,
    };
    return create({ ...this.defaultOptions, pk: productId, item });
  }

  async getById(productId: string, reviewId: string): Promise<ReviewDto> {
    return getById({ ...this.defaultOptions, pk: productId, sk: reviewId });
  }

  async getAll(
    productId: string,
    lastEvaluatedKey?: string
  ): Promise<GetReviewsDto> {
    const { items, paginationToken } = await query({
      ...this.defaultOptions,
      paginationToken: lastEvaluatedKey,
      pk: productId,
      sk: '',
      inDescendingOrder: true,
    });

    return {
      reviews: items,
      paginationToken,
    };
  }

  async delete(productId: string, reviewId: string): Promise<ReviewDto> {
    return deleteItem({ ...this.defaultOptions, pk: productId, sk: reviewId });
  }

  async update(
    productId: string,
    reviewId: string,
    updatedReview: UpdateReviewDto,
    returnOriginalValues?: boolean
  ): Promise<ReviewDto> {
    return update({
      ...this.defaultOptions,
      pk: productId,
      sk: reviewId,
      item: updatedReview,
      returnOriginalValues,
    });
  }
}
