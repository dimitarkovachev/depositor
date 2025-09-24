import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ChainTransferService } from './chain-transfer.service';
import { ChainTransferController } from './chain-transfer.controller';
import { DepositsModule } from '../../deposits/deposits.module';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [
    DepositsModule,
    HttpModule,
    ConfigModule,
    CoreModule,
  ],
  controllers: [ChainTransferController],
  providers: [ChainTransferService],
})
export class ChainTransferModule {}
