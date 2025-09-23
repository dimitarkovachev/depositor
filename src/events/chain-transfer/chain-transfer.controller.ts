import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChainTransferService } from './chain-transfer.service';
import { CreateChainTransferDto } from './dto/create-chain-transfer.dto';
import { UpdateChainTransferDto } from './dto/update-chain-transfer.dto';

@Controller('chain-transfer')
export class ChainTransferController {
  constructor(private readonly chainTransferService: ChainTransferService) {}

  @Post()
  create(@Body() createChainTransferDto: CreateChainTransferDto) {
    return this.chainTransferService.create(createChainTransferDto);
  }
}
