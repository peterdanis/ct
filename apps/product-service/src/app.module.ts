import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ReviewProcessingModule } from './modules/review-processing/review-processing.module';
import { SharedModule } from './modules/shared/shared.module';

@Module({
  imports: [
    ProductsModule,
    ReviewsModule,
    ReviewProcessingModule,
    SharedModule,
  ],
})
export class AppModule {}
