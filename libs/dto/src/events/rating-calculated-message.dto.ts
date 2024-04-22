import {
  Contains,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { EventDto } from './event.dto';
import { Type } from 'class-transformer';

export enum RatingCalculatedType {
  calculated = 'com.ct.product.review.rating.calculated',
}

export class RatingCalculatedData {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  averageRating: number;
}

export class RatingCalculatedMessageDto extends EventDto<RatingCalculatedData> {
  @Contains(RatingCalculatedType.calculated)
  type: RatingCalculatedType.calculated;

  @ValidateNested()
  @Type(() => RatingCalculatedData)
  data: RatingCalculatedData;
}
