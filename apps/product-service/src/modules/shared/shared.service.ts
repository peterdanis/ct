import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

@Injectable()
export class SharedService {
  getConfig() {
    return {
      dynamoDb: {
        endpoint: process.env.DYNAMODB_ENDPOINT,
        table: process.env.DYNAMODB_TABLE,
      },
    };
  }

  getDynamoDbDocumentClient() {
    const bareboneClient = new DynamoDBClient({
      endpoint: this.getConfig().dynamoDb.endpoint,
    });
    return DynamoDBDocumentClient.from(bareboneClient, {
      marshallOptions: {
        convertClassInstanceToMap: true,
        removeUndefinedValues: true,
      },
    });
  }

  encodeToBase64(input: string | Record<string, unknown>) {
    return Buffer.from(JSON.stringify(input)).toString('base64url');
  }

  decodeFromBase64(encodedString: string) {
    try {
      return JSON.parse(
        Buffer.from(encodedString, 'base64url').toString('utf-8')
      );
    } catch (error) {
      throw new BadRequestException();
    }
  }

  /**
   * Use to validate objects from outside of this service
   * @throws InternalServerErrorException
   */
  validateAndStrip<T>(object: unknown, dto: ClassConstructor<T>): T {
    const instance = plainToInstance(dto, object);
    const errors = validateSync(instance as Record<string, unknown>, {
      whitelist: true,
    });
    if (errors.length > 0) {
      Logger.warn('Some of the validated object did not pass validation');
      Logger.warn(errors);
      throw new InternalServerErrorException();
    }
    return instance;
  }
}
