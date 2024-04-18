import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductRepository } from './products.repository';
import { SharedService } from '../shared/shared.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, SharedService],
})
export class ProductsModule {}
