import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppService } from './app.service';
import { ulid } from 'ulidx';
import { KafkaModule } from '@ct/kafka';
import { AppRepository } from './app.repository';
import { ConfigService } from './config.service';

@Module({
  imports: [
    KafkaModule,
    LoggerModule.forRootAsync({
      useFactory: async () => {
        return {
          // TODO: add correlation ID to event logs
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
  providers: [AppService, AppRepository, ConfigService],
})
export class AppModule {}
