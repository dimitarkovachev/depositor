import { Module } from '@nestjs/common';
import { ChainTransferService } from './chain-transfer.service';
import { ChainTransferController } from './chain-transfer.controller';

@Module({
  controllers: [ChainTransferController],
  providers: [ChainTransferService],
})
export class ChainTransferModule {}
