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
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller({
  version: '1',
  path: 'products',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOkResponse({ type: GetProductsDto })
  @ApiQuery({ name: 'paginationToken', required: false, type: String })
  async getAll(
    @Query('paginationToken') paginationToken?: string
  ): Promise<GetProductsDto> {
    return this.productsService.getAll(paginationToken);
  }

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto
  ): Promise<ProductDto> {
    return this.productsService.create(createProductDto);
  }

  @Get(':productId')
  @ApiOkResponse({ type: ProductDto })
  async getByproductId(
    @Param('productId') productId: string
  ): Promise<ProductDto> {
    return this.productsService.getOne(productId);
  }

  @Patch(':productId')
  async update(
    @Body() updateProductDto: UpdateProductDto,
    @Param('productId') productId: string
  ): Promise<ProductDto> {
    return this.productsService.update(productId, updateProductDto);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('productId') productId: string): Promise<void> {
    return this.productsService.delete(productId);
  }
}
