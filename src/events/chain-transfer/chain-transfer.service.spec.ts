import { Test, TestingModule } from '@nestjs/testing';
import { ChainTransferService } from './chain-transfer.service';
import { DepositsService } from '../../deposits/deposits.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

describe('ChainTransferService', () => {
  let service: ChainTransferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<ChainTransferService>(ChainTransferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
