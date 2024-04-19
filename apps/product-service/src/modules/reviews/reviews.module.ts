import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { ProductsRepository } from '../products/products.repository';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository, ProductsRepository],
})
export class ReviewsModule {}
