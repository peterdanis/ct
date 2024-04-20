import { Module } from '@nestjs/common';
import { ReviewProcessingService } from './review-processing.service';
import { KafkaModule } from '@ct/kafka';

@Module({
  imports: [KafkaModule],
  providers: [ReviewProcessingService],
})
export class ReviewProcessingModule {}
