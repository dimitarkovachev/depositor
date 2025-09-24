import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DepositsService } from './deposits.service';

@ApiTags('deposits')
@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all deposits' })
  @ApiQuery({ name: 'merchantId', required: false, description: 'Filter deposits by merchant ID' })
  @ApiResponse({ status: 200, description: 'List of deposits retrieved successfully' })
  findAll(@Query('merchantId') merchantId?: string) {
    return this.depositsService.findAll(merchantId);
  }
}
