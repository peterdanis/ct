import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewDto } from './review.dto';

export class GetReviewsDto {
  @ApiProperty({ isArray: true, type: ReviewDto })
  @IsArray({ each: true })
  @ValidateNested()
  reviews: ReviewDto[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  paginationToken: string;
}
