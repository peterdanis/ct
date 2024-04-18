import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulidx';
import { SharedService } from '../shared/shared.service';

@Injectable()
export class ReviewsRepository {
  documentClient: DynamoDBDocumentClient;
  tableName: string;

  constructor(private readonly sharedService: SharedService) {
    this.documentClient = this.sharedService.getDynamoDbDocumentClient();
    this.tableName = this.sharedService.getConfig().dynamoDb.table;
  }

  getKeys(productId: string, reviewId: string): Record<string, unknown> {
    return {
      PK: `PRODUCT#${productId}`,
      SK: `#REVIEW#${reviewId}`,
    };
  }
}
