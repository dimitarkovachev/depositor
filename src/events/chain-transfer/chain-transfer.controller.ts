import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChainTransferService } from './chain-transfer.service';
import { CreateChainTransferDto } from './dto/create-chain-transfer.dto';
import { UpdateChainTransferDto } from './dto/update-chain-transfer.dto';

@ApiTags('chain-transfers')
@Controller('chain-transfer')
export class ChainTransferController {
  constructor(private readonly chainTransferService: ChainTransferService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chain transfer' })
  @ApiResponse({ status: 201, description: 'Chain transfer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createChainTransferDto: CreateChainTransferDto) {
    return this.chainTransferService.create(createChainTransferDto);
  }
}
