import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import {
  GetReviewsDto,
  ReviewDto,
  CreateReviewDto,
  UpdateReviewDto,
} from '@ct/dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('reviews')
@ApiBadRequestResponse()
@UseInterceptors(CacheInterceptor)
@Controller({
  version: '1',
  path: 'products/:productId/reviews',
})
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOkResponse({ type: GetReviewsDto })
  @ApiQuery({ name: 'paginationToken', required: false, type: String })
  async getAll(
    @Param('productId') productId: string,
    @Query('paginationToken') paginationToken?: string
  ): Promise<GetReviewsDto> {
    return this.reviewsService.getAll(productId, paginationToken);
  }

  @Post()
  @ApiCreatedResponse({ type: ReviewDto })
  @ApiNotFoundResponse()
  async create(
    @Param('productId') productId: string,
    @Body() createReviewDto: CreateReviewDto
  ) {
    return this.reviewsService.create(productId, createReviewDto);
  }

  @Get(':reviewId')
  @ApiOkResponse({ type: ReviewDto })
  @ApiNotFoundResponse()
  async getById(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string
  ) {
    return this.reviewsService.getById(productId, reviewId);
  }

  @Patch(':reviewId')
  @ApiOkResponse({ type: ReviewDto })
  @ApiNotFoundResponse()
  async update(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    return this.reviewsService.update(productId, reviewId, updateReviewDto);
  }

  @Delete(':reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string
  ) {
    return this.reviewsService.delete(productId, reviewId);
  }
}
