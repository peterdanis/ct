import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from './config.service';
import {
  DynamoDbClient,
  DynamoDbClientActionsInput,
  getDynamoDbClient,
  update,
} from '@ct/dynamo-db';
import { AttributeAction } from '@aws-sdk/client-dynamodb';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

class RatingDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  reviewCount: number;

  @IsNumber()
  reviewRatingSum: number;
}

@Injectable()
export class AppRepository {
  private dynamoDbClient: DynamoDbClient;
  private defaultOptions: Omit<DynamoDbClientActionsInput<RatingDto>, 'pk'>;
  private tableName: string;
  private logger = new Logger(AppRepository.name);

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
      dto: RatingDto,
      getKeys: this.getKeys,
    };
  }

  getKeys(productId: string): Record<string, unknown> {
    return {
      productId,
    };
  }

  async update(productId: string, item): Promise<RatingDto> {
    return update({
      ...this.defaultOptions,
      pk: productId,
      item,
      operationPerItemAttribute: {
        reviewRatingSum: AttributeAction.ADD,
        reviewCount: AttributeAction.ADD,
      },
      createIfNotExists: true,
    });
  }
}
