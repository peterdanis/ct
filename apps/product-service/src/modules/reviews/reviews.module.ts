import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { SharedService } from '../shared/shared.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository, SharedService],
})
export class ReviewsModule {}
