import { Test, TestingModule } from '@nestjs/testing';
import { ChainTransferService } from './chain-transfer.service';

describe('ChainTransferService', () => {
  let service: ChainTransferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChainTransferService],
    }).compile();

    service = module.get<ChainTransferService>(ChainTransferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
