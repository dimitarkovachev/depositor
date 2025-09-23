import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { Deposit, DepositStatus } from './entities/deposit.entity';
import { CreateDepositDto } from './dto/create-deposit.dto';

describe('DepositsService', () => {
  let service: DepositsService;
  let repository: Repository<Deposit>;
  let dataSource: any;
  let entityManager: any;

  const mockCreateDepositDto: CreateDepositDto = {
    txHash: '0x1234567890abcdef',
    network: 'ethereum',
    asset: 'ETH',
    amount: 1.5,
    fromAddress: '0xfrom123',
    toAddress: '0xto123',
    merchantId: 'merchant123',
    occurredAt: '2024-01-01T00:00:00.000Z',
    confirmations: 0,
    status: DepositStatus.PENDING,
  };

  const mockDeposit: Deposit = {
    txHash: '0x1234567890abcdef',
    network: 'ethereum',
    asset: 'ETH',
    amount: 1.5,
    fromAddress: '0xfrom123',
    toAddress: '0xto123',
    merchantId: 'merchant123',
    occurredAt: new Date('2024-01-01T00:00:00.000Z'),
    confirmations: 0,
    status: DepositStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    entityManager = {
      findOne: jest.fn(),
      create: jest.fn(),
      insert: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositsService,
        {
          provide: getRepositoryToken(Deposit),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<DepositsService>(DepositsService);
    repository = module.get<Repository<Deposit>>(getRepositoryToken(Deposit));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new deposit when txHash does not exist', async () => {
      // Arrange
      dataSource.transaction.mockImplementation(async (callback) => {
        return await callback(entityManager);
      });
      entityManager.findOne.mockResolvedValue(null);
      entityManager.create.mockReturnValue(mockDeposit);
      entityManager.insert.mockResolvedValue({});

      // Act
      const result = await service.create(mockCreateDepositDto);

      // Assert
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(entityManager.findOne).toHaveBeenCalledWith(Deposit, {
        where: { txHash: mockCreateDepositDto.txHash },
      });
      expect(entityManager.create).toHaveBeenCalledWith(Deposit, {
        ...mockCreateDepositDto,
        occurredAt: new Date(mockCreateDepositDto.occurredAt),
        status: mockCreateDepositDto.status || DepositStatus.PENDING,
        confirmations: mockCreateDepositDto.confirmations || 0,
      });
      expect(entityManager.insert).toHaveBeenCalledWith(Deposit, mockDeposit);
    });

    it('should throw ConflictException when txHash already exists', async () => {
      // Arrange
      dataSource.transaction.mockImplementation(async (callback) => {
        return await callback(entityManager);
      });
      entityManager.findOne.mockResolvedValue(mockDeposit);

      // Act & Assert
      await expect(service.create(mockCreateDepositDto)).rejects.toThrow(
        new ConflictException(`Deposit with txHash ${mockCreateDepositDto.txHash} already exists`),
      );

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(entityManager.findOne).toHaveBeenCalledWith(Deposit, {
        where: { txHash: mockCreateDepositDto.txHash },
      });
      expect(entityManager.create).not.toHaveBeenCalled();
      expect(entityManager.insert).not.toHaveBeenCalled();
    });

    it('should use default values when optional fields are not provided', async () => {
      // Arrange
      const createDepositDtoWithoutDefaults: CreateDepositDto = {
        txHash: '0x1234567890abcdef',
        network: 'ethereum',
        asset: 'ETH',
        amount: 1.5,
        fromAddress: '0xfrom123',
        toAddress: '0xto123',
        merchantId: 'merchant123',
        occurredAt: '2024-01-01T00:00:00.000Z',
      };

      dataSource.transaction.mockImplementation(async (callback) => {
        return await callback(entityManager);
      });
      entityManager.findOne.mockResolvedValue(null);
      entityManager.create.mockReturnValue(mockDeposit);
      entityManager.insert.mockResolvedValue({});

      // Act
      await service.create(createDepositDtoWithoutDefaults);

      // Assert
      expect(entityManager.create).toHaveBeenCalledWith(Deposit, {
        ...createDepositDtoWithoutDefaults,
        occurredAt: new Date(createDepositDtoWithoutDefaults.occurredAt),
        status: DepositStatus.PENDING,
        confirmations: 0,
      });
    });

    it('should handle transaction rollback on error', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      dataSource.transaction.mockImplementation(async (callback) => {
        return await callback(entityManager);
      });
      entityManager.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(service.create(mockCreateDepositDto)).rejects.toThrow(error);
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    });
  });
});
