import {
  Body,
  Controller,
  Delete,
  Get,
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
  async getAll(@Query('paginationToken') paginationToken?: string) {
    return this.productsService.getAll(paginationToken);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
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
  async update(@Param('productId') productId: string) {
    return this.productsService.update(productId);
  }

  @Delete(':productId')
  async delete(@Param('productId') productId: string) {
    return this.productsService.delete(productId);
  }
}
