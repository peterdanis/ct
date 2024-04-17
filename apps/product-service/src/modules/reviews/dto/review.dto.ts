import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';

export class ReviewDto extends CreateReviewDto {
  @ApiProperty()
  @IsString()
  id: string;
}
