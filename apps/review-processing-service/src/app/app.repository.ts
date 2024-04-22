import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from './config.service';
import {
  DynamoDbClient,
  DynamoDbClientActionsInput,
  getDynamoDbClient,
  update,
} from '@ct/dynamo-db';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import {
  AttributeAction,
  AttributeValueUpdate,
  ConditionalCheckFailedException,
  ReturnValue,
} from '@aws-sdk/client-dynamodb';
import { extractFirstKey, validateAndStrip } from '@ct/utils';
import { ReviewModifiedType } from '@ct/dto';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class Offsets {
  [key: number]: number;
}

class RatingDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  // @Exi
  // @Type(() => Offsets)
  // offsets: Offsets;

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

  async update(productId: string, item, offsets: Offsets): Promise<RatingDto> {
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
