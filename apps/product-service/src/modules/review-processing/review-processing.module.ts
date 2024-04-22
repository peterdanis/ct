import { Module } from '@nestjs/common';
import { ReviewProcessingService } from './review-processing.service';
import { KafkaModule } from '@ct/kafka';
import { ProductsRepository } from '../products/products.repository';

@Module({
  imports: [KafkaModule],
  providers: [ReviewProcessingService, ProductsRepository],
})
export class ReviewProcessingModule {}
