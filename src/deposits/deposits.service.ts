import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource } from 'typeorm';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { Deposit, DepositStatus } from './entities/deposit.entity';

@Injectable()
export class DepositsService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDepositDto: CreateDepositDto) {
    return await this.dataSource.transaction(async (manager) => {
      // First check if a deposit with the same txHash already exists
      const existingDeposit = await manager.findOne(Deposit, {
        where: { txHash: createDepositDto.txHash }
      });

      if (existingDeposit) {
        throw new ConflictException(`Deposit with txHash ${createDepositDto.txHash} already exists`);
      }

      // Create and insert the new deposit
      const deposit = manager.create(Deposit, {
        ...createDepositDto,
        occurredAt: new Date(createDepositDto.occurredAt),
        status: createDepositDto.status || DepositStatus.PENDING,
        confirmations: createDepositDto.confirmations || 0,
      });

      await manager.insert(Deposit, deposit);
    });
  }

  async findAll(merchantId?: string): Promise<Deposit[]> {
    const where: FindOptionsWhere<Deposit> = {};
    
    if (merchantId) {
      where.merchantId = merchantId;
    }
    
    return await this.depositRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(txHash: string): Promise<Deposit> {
    const deposit = await this.depositRepository.findOne({ where: { txHash:   txHash } });
    
    if (!deposit) {
      throw new NotFoundException(`Deposit with ID ${txHash} not found`);
    }
    
    return deposit;
  }

  async update(txHash: string, updateDepositDto: UpdateDepositDto): Promise<Deposit> {
    const deposit = await this.findOne(txHash);
    
    Object.assign(deposit, updateDepositDto);
    
    if (updateDepositDto.occurredAt) {
      deposit.occurredAt = new Date(updateDepositDto.occurredAt);
    }
    
    return await this.depositRepository.save(deposit);
  }
}
