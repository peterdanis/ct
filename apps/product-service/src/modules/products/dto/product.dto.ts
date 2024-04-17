import { IsNumber, IsString, Max, Min } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ProductDto extends CreateProductDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  averageRating: number;
}
