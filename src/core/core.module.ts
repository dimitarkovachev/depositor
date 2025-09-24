import { Module } from '@nestjs/common';
import { DeadLetterLogService } from './dead-letter-log.service';

@Module({
  providers: [DeadLetterLogService],
  exports: [DeadLetterLogService],
})
export class CoreModule {}
