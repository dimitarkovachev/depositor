import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';
import { Deposit, DepositStatus } from './entities/deposit.entity';

describe('DepositsController', () => {
  let controller: DepositsController;
  let service: DepositsService;
  let repository: Repository<Deposit>;

  const mockDeposit: Deposit = {
    txHash: '0x1234567890abcdef',
    network: 'ethereum',
    asset: 'ETH',
    amount: 1.5,
    fromAddress: '0xfrom123',
    toAddress: '0xto456',
    confirmations: 6,
    status: DepositStatus.CONFIRMED,
    merchantId: 'm_001',
    occurredAt: new Date('2024-01-01T00:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepositsController],
      providers: [
        DepositsService,
        {
          provide: getRepositoryToken(Deposit),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<DepositsController>(DepositsController);
    service = module.get<DepositsService>(DepositsService);
    repository = module.get<Repository<Deposit>>(getRepositoryToken(Deposit));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all deposits when no merchantId is provided', async () => {
      const expectedResult = [mockDeposit];
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return deposits for specific merchant when merchantId is provided', async () => {
      const merchantId = 'm_001';
      const expectedResult = [mockDeposit];
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      const result = await controller.findAll(merchantId);

      expect(result).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(merchantId);
    });
  });
});
