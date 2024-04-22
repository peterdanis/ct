import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import type { CloudEventV1 } from 'cloudevents';

type Attributes =
  | 'id'
  | 'type'
  | 'source'
  | 'specversion'
  | 'subject'
  | 'time'
  | 'data';

export class EventDto<TData> implements Pick<CloudEventV1<TData>, Attributes> {
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
}
