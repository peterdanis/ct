import { Type } from 'class-transformer';
import {
  Contains,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { EventDto } from './event.dto';

export enum ReviewModifiedType {
  created = 'com.ct.product.review.created',
  updated = 'com.ct.product.review.updated',
  deleted = 'com.ct.product.review.deleted',
}

export class ReviewData {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  reviewId: string;
}

export class ReviewCreatedData extends ReviewData {
  @IsInt()
  @Min(1)
  @Max(5)
  newRating: number;
}

export class ReviewCreatedMessageDto extends EventDto<ReviewCreatedData> {
  @Contains(ReviewModifiedType.created)
  type: ReviewModifiedType.created;

  @ValidateNested()
  @Type(() => ReviewCreatedData)
  data: ReviewCreatedData;
}

export class ReviewUpdatedData extends ReviewCreatedData {
  @IsInt()
  @Min(1)
  @Max(5)
  oldRating: number;
}

export class ReviewUpdatedMessageDto extends EventDto<ReviewCreatedData> {
  @Contains(ReviewModifiedType.updated)
  type: ReviewModifiedType.updated;

  @ValidateNested()
  @Type(() => ReviewUpdatedData)
  data: ReviewUpdatedData;
}

export class ReviewDeletedData extends ReviewData {
  @IsInt()
  @Min(1)
  @Max(5)
  oldRating: number;
}

export class ReviewDeletedMessageDto extends EventDto<ReviewDeletedData> {
  @Contains(ReviewModifiedType.deleted)
  type: ReviewModifiedType.deleted;

  @ValidateNested()
  @Type(() => ReviewDeletedData)
  data: ReviewDeletedData;
}
