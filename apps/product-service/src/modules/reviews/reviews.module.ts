import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from '../shared/reviews.repository';
import { ProductsRepository } from '../shared/products.repository';
import { KafkaModule } from '@ct/kafka';

@Module({
  imports: [KafkaModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository, ProductsRepository],
})
export class ReviewsModule {}
