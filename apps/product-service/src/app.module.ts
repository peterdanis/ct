import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ReviewProcessingModule } from './modules/review-processing/review-processing.module';

@Module({
  imports: [ProductsModule, ReviewsModule, ReviewProcessingModule],
})
export class AppModule {}
