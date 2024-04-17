import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { ReviewDto } from './dto/review.dto';

@ApiTags('reviews')
@Controller({
  version: '1',
  path: 'products/:productId/reviews',
})
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get()
  @ApiOkResponse({ type: GetReviewsDto })
  @ApiQuery({ name: 'paginationToken', required: false, type: String })
  async getAll(@Query('paginationToken') paginationToken?: string) {
    return this.reviewsService.getAll(paginationToken);
  }

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get(':reviewId')
  @ApiOkResponse({ type: ReviewDto })
  async getById(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string
  ) {
    return this.reviewsService.getOne(reviewId);
  }

  @Patch(':reviewId')
  async update(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string
  ) {
    return this.reviewsService.update(reviewId);
  }

  @Delete(':reviewId')
  async delete(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string
  ) {
    return this.reviewsService.delete(reviewId);
  }
}
