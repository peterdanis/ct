import { ConsumerService } from '@ct/kafka';
import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { SharedService } from '../shared/shared.service';

@Controller()
export class ReviewProcessingController implements OnModuleInit {
  private logger = new Logger(ReviewProcessingController.name);

  constructor(
    private readonly consumerService: ConsumerService,
    private readonly sharedService: SharedService
  ) {}

  async onModuleInit() {
    await this.consumerService.consume({
      brokers: this.sharedService.getConfig().kafka.bootstrapServers.split(','),
      topic: 'test',
      // TODO: make configurable
      config: { groupId: 'test-consumer' },
      onMessage: async (message) => {
        this.logger.log(message);
      },
    });
  }
}
