import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import type { CloudEventV1 } from 'cloudevents';

export enum ReviewModifiedAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

type Attributes =
  | 'id'
  | 'type'
  | 'source'
  | 'specversion'
  | 'subject'
  | 'time'
  | 'data';

class ReviewModifiedData {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  reviewId: string;

  @IsInt()
  rating: number;

  @IsEnum(ReviewModifiedAction)
  action: ReviewModifiedAction;
}

export class ReviewModifiedMessageDto
  implements Pick<CloudEventV1<ReviewModifiedData>, Attributes>
{
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsString()
  @IsNotEmpty()
  specversion: string;

  @IsDateString()
  @IsNotEmpty()
  time: string;

  @ValidateNested()
  @Type(() => ReviewModifiedData)
  data: ReviewModifiedData;

  // TODO: decide whether to include or not
  // @IsString()
  // @IsNotEmpty()
  // correlationId: string;
}
