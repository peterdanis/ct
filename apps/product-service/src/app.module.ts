import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ReviewProcessingModule } from './modules/review-processing/review-processing.module';
import { SharedModule } from './modules/shared/shared.module';
import { LoggerModule } from 'nestjs-pino';
import { ulid } from 'ulidx';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { ConfigService } from './modules/shared/config.service';
import { redisStore } from 'cache-manager-redis-store';

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
    CacheModule.registerAsync<RedisClientOptions>({
      inject: [ConfigService],
      // TODO: figure out version incompatibility
      // @ts-ignore
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          ttl: configService.redis.ttl,
          socket: configService.redis.socket,
        }),
      }),
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
