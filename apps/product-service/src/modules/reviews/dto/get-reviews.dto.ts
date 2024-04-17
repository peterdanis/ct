import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewDto } from './review.dto';

export class GetReviewsDto {
  @ApiProperty({ isArray: true, type: ReviewDto })
  @IsArray({ each: true })
  @ValidateNested()
  reviews: ReviewDto[];
}
