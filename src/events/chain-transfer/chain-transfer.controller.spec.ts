import { Test, TestingModule } from '@nestjs/testing';
import { ChainTransferController } from './chain-transfer.controller';
import { ChainTransferService } from './chain-transfer.service';

describe('ChainTransferController', () => {
  let controller: ChainTransferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChainTransferController],
      providers: [ChainTransferService],
    }).compile();

    controller = module.get<ChainTransferController>(ChainTransferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
