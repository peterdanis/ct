import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulidx';
import { ProductDto } from './dto/product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { SharedService } from '../shared/shared.service';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ConditionalCheckFailedException,
  ReturnValue,
} from '@aws-sdk/client-dynamodb';

type ProductEntity = ProductDto & {
  PK: string;
  SK: string;
};

@Injectable()
export class ProductRepository {
  documentClient: DynamoDBDocumentClient;
  tableName: string;

  constructor(private readonly sharedService: SharedService) {
    this.documentClient = this.sharedService.getDynamoDbDocumentClient();
    this.tableName = this.sharedService.getConfig().dynamoDb.table;
  }

  getKeys(productId: string): Record<string, unknown> {
    return {
      PK: `PRODUCT#${productId}`,
      SK: 'PRODUCT',
    };
  }

  async create(productInput: CreateProductDto): Promise<ProductDto> {
    const productId = ulid();
    const product = { productId, ...productInput };
    const putItemCommand = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...this.getKeys(productId),
        ...product,
      },
      Expected: {
        PK: {
          Exists: false,
        },
      },
    });
    await this.documentClient.send(putItemCommand);
    return product;
  }

  async getById(productId: string): Promise<ProductDto> {
    Logger.log({ productId }, 'product-db.repository.getById.input');
    const getItemCommand = new GetCommand({
      TableName: this.tableName,
      Key: this.getKeys(productId),
    });

    const { Item } = await this.documentClient.send(getItemCommand);

    if (!Item) {
      throw new NotFoundException();
    }

    return this.sharedService.validateAndStrip(Item, ProductDto);
  }

  async getAll(lastEvaluatedKey?: string): Promise<GetProductsDto> {
    const exclusiveStartKey = lastEvaluatedKey
      ? this.sharedService.decodeFromBase64(lastEvaluatedKey)
      : undefined;
    const scanCommand = new ScanCommand({
      TableName: this.tableName,
      ExclusiveStartKey: exclusiveStartKey,
    });

    const { Items, LastEvaluatedKey } = await this.documentClient.send(
      scanCommand
    );

    const paginationToken = LastEvaluatedKey
      ? this.sharedService.encodeToBase64(LastEvaluatedKey)
      : undefined;
    const products = Items.reduce((result, product) => {
      try {
        result.push(this.sharedService.validateAndStrip(product, ProductDto));
      } catch (error) {
        // Ignore given item
      }
      return result;
    }, []);
    return {
      products,
      paginationToken,
    } as GetProductsDto;
  }

  async delete(productId: string): Promise<void> {
    const deleteCommand = new DeleteCommand({
      TableName: this.tableName,
      Key: this.getKeys(productId),
    });
    await this.documentClient.send(deleteCommand);
  }

  async update(
    productId: string,
    updatedProduct: UpdateProductDto
  ): Promise<ProductDto> {
    try {
      const attributeUpdates = {};
      const key = this.getKeys(productId);
      for (const [key, value] of Object.entries(updatedProduct)) {
        attributeUpdates[key] = { Value: value };
      }
      const updateItemCommand = new UpdateCommand({
        TableName: this.tableName,
        Key: key,
        AttributeUpdates: attributeUpdates,
        ReturnValues: ReturnValue.ALL_NEW,
        Expected: {
          PK: {
            Exists: true,
            Value: key.PK,
          },
        },
      });
      const { Attributes } = await this.documentClient.send(updateItemCommand);
      return this.sharedService.validateAndStrip(Attributes, ProductDto);
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new NotFoundException();
      }
    }
  }
}