import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ReviewProcessingModule } from './modules/review-processing/review-processing.module';
import { SharedModule } from './modules/shared/shared.module';
import { LoggerModule } from 'nestjs-pino';
import { ulid } from 'ulidx';

@Module({
  imports: [
    ProductsModule,
    ReviewsModule,
    ReviewProcessingModule,
    SharedModule,
    LoggerModule.forRootAsync({
      useFactory: async () => {
        return {
          pinoHttp: {
            level: 'debug',
            quietReqLogger: true,
            genReqId: (request) =>
              request.headers['x-correlation-id'] || ulid(),
          },
        };
      },
    }),
  ],
})
export class AppModule {}
