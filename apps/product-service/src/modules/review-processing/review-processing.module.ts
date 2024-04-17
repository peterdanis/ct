import { Module } from '@nestjs/common';
import { ReviewProcessingService } from './review-processing.service';

@Module({
  providers: [ReviewProcessingService],
})
export class ReviewProcessingModule {}
