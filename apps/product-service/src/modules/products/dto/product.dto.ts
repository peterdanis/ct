import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ProductDto extends CreateProductDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  averageRating?: number;
}
