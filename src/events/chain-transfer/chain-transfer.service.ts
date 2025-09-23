import { Injectable } from '@nestjs/common';
import { CreateChainTransferDto } from './dto/create-chain-transfer.dto';
import { UpdateChainTransferDto } from './dto/update-chain-transfer.dto';

@Injectable()
export class ChainTransferService {
  create(createChainTransferDto: CreateChainTransferDto) {
    return 'This action adds a new chainTransfer';
  }
}
