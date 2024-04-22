import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ProductsRepository } from './products.repository';
import { ReviewsRepository } from './reviews.repository';

@Global()
@Module({
  providers: [ConfigService, ProductsRepository, ReviewsRepository],
  exports: [ConfigService, ProductsRepository, ReviewsRepository],
})
export class SharedModule {}
