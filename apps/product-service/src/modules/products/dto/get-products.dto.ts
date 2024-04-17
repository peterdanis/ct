import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class GetProductsDto {
  @ApiProperty({ isArray: true, type: ProductDto })
  @IsArray({ each: true })
  @ValidateNested()
  products: ProductDto[];
}
