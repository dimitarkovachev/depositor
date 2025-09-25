import { Test, TestingModule } from '@nestjs/testing';
import { ChainTransferController } from './chain-transfer.controller';
import { ChainTransferService } from './chain-transfer.service';
import { DepositsService } from '../../deposits/deposits.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DeadLetterLogService } from '../../core/dead-letter-log.service';

describe('ChainTransferController', () => {
  let controller: ChainTransferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChainTransferController],
      providers: [
        ChainTransferService,
        {
          provide: DepositsService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(12),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: DeadLetterLogService,
          useValue: {
            write: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChainTransferController>(ChainTransferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
