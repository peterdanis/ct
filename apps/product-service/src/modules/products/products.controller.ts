import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  GetProductsDto,
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
} from '@ct/dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('products')
@ApiBadRequestResponse()
@UseInterceptors(CacheInterceptor)
@Controller({
  version: '1',
  path: 'products',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOkResponse({ type: GetProductsDto })
  @ApiQuery({ name: 'paginationToken', required: false, type: String })
  @CacheTTL(2) // decrease cache TTL
  async getAll(
    @Query('paginationToken') paginationToken?: string
  ): Promise<GetProductsDto> {
    return this.productsService.getAll(paginationToken);
  }

  @Post()
  @ApiCreatedResponse({ type: ProductDto })
  async create(
    @Body() createProductDto: CreateProductDto
  ): Promise<ProductDto> {
    return this.productsService.create(createProductDto);
  }

  @Get(':productId')
  @ApiOkResponse({ type: ProductDto })
  @ApiNotFoundResponse()
  async getByproductId(
    @Param('productId') productId: string
  ): Promise<ProductDto> {
    return this.productsService.getById(productId);
  }

  @Patch(':productId')
  @ApiOkResponse({ type: ProductDto })
  @ApiNotFoundResponse()
  async update(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<ProductDto> {
    return this.productsService.update(productId, updateProductDto);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('productId') productId: string): Promise<void> {
    return this.productsService.delete(productId);
  }
}
