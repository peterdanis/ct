import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

@Injectable()
export class SharedService {
  private logger = new Logger(SharedService.name);

  getConfig() {
    return {
      dynamoDb: {
        endpoint: process.env.DYNAMODB_ENDPOINT,
        table: process.env.DYNAMODB_TABLE,
      },
      kafka: {
        bootstrapServers: process.env.KAFKA_BOOTSTRAP_SERVERS,
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

  /**
   * Validates, strips and transforms each item. Items not adhering to DTO are excluded from the result and logged.
   * @param dto DTO or class to validate items against
   * @returns a function to be used in Array.reduce()
   */
  getAllReducer<T>(dto: ClassConstructor<T>): (arr: T[], item: T) => T[] {
    return (finalArray, item) => {
      try {
        finalArray.push(this.validateAndStrip(item, dto));
      } catch (error) {
        // Ignore given item in output, just log - single bad db item should not break getAll endpoint
        this.logger.error({ item, error }, 'getAllReducer.invalidDbItemFound');
      }
      return finalArray;
    };
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
      this.logger.warn(errors);
      throw new Error('Some of the validated object did not pass validation');
    }
    return instance;
  }
}
