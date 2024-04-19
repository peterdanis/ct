import { Module } from '@nestjs/common';
import { ReviewProcessingService } from './review-processing.service';
import { ReviewProcessingController } from './review-processing.controller';
import { KafkaModule } from '@ct/kafka';

@Module({
  imports: [KafkaModule],
  controllers: [ReviewProcessingController],
  providers: [ReviewProcessingService],
})
export class ReviewProcessingModule {}
