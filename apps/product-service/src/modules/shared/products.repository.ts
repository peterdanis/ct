import { Injectable, Logger } from '@nestjs/common';
import { ulid } from 'ulidx';
import { ConfigService } from './config.service';
import {
  CreateProductDto,
  GetProductsDto,
  ProductDto,
  UpdateProductDto,
} from '@ct/dto';
import {
  DynamoDbClient,
  DynamoDbClientActionsInput,
  create,
  deleteItem,
  getById,
  getDynamoDbClient,
  scan,
  update,
} from '@ct/dynamo-db';

@Injectable()
export class ProductsRepository {
  private dynamoDbClient: DynamoDbClient;
  private defaultOptions: Omit<DynamoDbClientActionsInput<ProductDto>, 'pk'>;
  private tableName: string;
  private logger = new Logger(ProductsRepository.name);

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
      dto: ProductDto,
      getKeys: this.getKeys,
    };
  }

  getKeys(productId: string): Record<string, unknown> {
    return {
      PK: `PRODUCT#${productId}`,
      SK: 'PRODUCT',
    };
  }

  async create(productInput: CreateProductDto): Promise<ProductDto> {
    const productId = ulid();
    const item = { ...this.getKeys(productId), productId, ...productInput };
    return create({ ...this.defaultOptions, pk: productId, item });
  }

  async getById(productId: string): Promise<ProductDto> {
    return getById({ ...this.defaultOptions, pk: productId });
  }

  async getAll(lastEvaluatedKey?: string): Promise<GetProductsDto> {
    const { items, paginationToken } = await scan({
      ...this.defaultOptions,
      paginationToken: lastEvaluatedKey,
    });

    return {
      products: items,
      paginationToken,
    };
  }

  async delete(productId: string): Promise<ProductDto> {
    return deleteItem({ ...this.defaultOptions, pk: productId });
  }

  async update(
    productId: string,
    updatedProduct: UpdateProductDto & Pick<ProductDto, 'averageRating'>
  ): Promise<ProductDto> {
    return update({
      ...this.defaultOptions,
      pk: productId,
      item: updatedProduct,
    });
  }
}
