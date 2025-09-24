import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateChainTransferDto } from './dto/create-chain-transfer.dto';
import { UpdateChainTransferDto } from './dto/update-chain-transfer.dto';
import { DepositsService } from '../../deposits/deposits.service';
import { CreateDepositDto } from '../../deposits/dto/create-deposit.dto';
import { DepositStatus } from '../../deposits/entities/deposit.entity';
import { DeadLetterLogService } from '../../core/dead-letter-log.service';

@Injectable()
export class ChainTransferService {
  private readonly logger = new Logger(ChainTransferService.name);

  constructor(
    private readonly depositsService: DepositsService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly deadLetterLogService: DeadLetterLogService,
  ) {}

  async create(createChainTransferDto: CreateChainTransferDto) {
    const confirmationThreshold = this.configService.get<number>('CONFIRMATION_THRESHOLD', 12);
    
    // Check if confirmations meet the threshold
    if (createChainTransferDto.confirmations < confirmationThreshold) {
      this.logger.log(`Transaction ${createChainTransferDto.txHash} has ${createChainTransferDto.confirmations} confirmations, below threshold of ${confirmationThreshold}`);
      return;
    }

    try {
      // Parse to CreateDepositDto
      const createDepositDto: CreateDepositDto = {
        txHash: createChainTransferDto.txHash,
        network: createChainTransferDto.network,
        asset: createChainTransferDto.asset,
        amount: parseFloat(createChainTransferDto.amount),
        fromAddress: createChainTransferDto.fromAddress,
        toAddress: createChainTransferDto.toAddress,
        confirmations: createChainTransferDto.confirmations,
        status: DepositStatus.PENDING,
        merchantId: createChainTransferDto.merchant.id,
        occurredAt: createChainTransferDto.occurredAt,
      };

      // Create deposit
      await this.depositsService.create(createDepositDto);

      // Call webhook in background
      this.callWebhookInBackground(createChainTransferDto);
      
      this.logger.log(`Deposit created for txHash ${createChainTransferDto.txHash}`);
      return { message: 'Chain transfer processed successfully' };
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.log(`Deposit with txHash ${createChainTransferDto.txHash} already exists, skipping`);
        return;
      }
      throw error;
    }
  }

  private async callWebhookInBackground(createChainTransferDto: CreateChainTransferDto) {
    const webhookPayload = {
      type: 'deposit.updated',
      txHash: createChainTransferDto.txHash,
      status: 'confirmed',
      asset: createChainTransferDto.asset,
      amount: createChainTransferDto.amount,
      toAddress: createChainTransferDto.toAddress,
      confirmations: createChainTransferDto.confirmations,
      merchantId: createChainTransferDto.merchant.id,
      occurredAt: createChainTransferDto.occurredAt,
    };

    const maxRetries = 3;
    let retryCount = 0;
    let delay = 1000; // Start with 1 second

    while (retryCount < maxRetries) {
      try {
        const response = await firstValueFrom(
          this.httpService.post(createChainTransferDto.merchant.webhookUrl, webhookPayload, {
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': createChainTransferDto.merchant.webhookSecret,
            },
            timeout: 10000, // 10 second timeout
          })
        ) as any;

        if (response.status === 200) {
          this.logger.log(`Webhook call successful for txHash ${createChainTransferDto.txHash}`);
          
          // Update deposit status to completed
          try {
            await this.depositsService.update(createChainTransferDto.txHash, {
              status: DepositStatus.CONFIRMED,
            });
            this.logger.log(`Deposit status updated to completed for txHash ${createChainTransferDto.txHash}`);
          } catch (updateError) {
            this.logger.error(`Failed to update deposit status for txHash ${createChainTransferDto.txHash}:`, updateError);
          }
          
          return;
        }
      } catch (error) {
        retryCount++;
        this.logger.warn(`Webhook call failed for txHash ${createChainTransferDto.txHash}, attempt ${retryCount}/${maxRetries}:`, error.message);
        
        if (retryCount < maxRetries) {
          await this.delay(delay);
          delay *= 2;
        }
      }
    }

    this.logger.error(`Webhook call failed after ${maxRetries} attempts for txHash ${createChainTransferDto.txHash}`);
    
    // Write to dead letter log
    try {
      await this.deadLetterLogService.write(createChainTransferDto.txHash);
    } catch (deadLetterError) {
      this.logger.error(`Failed to write dead letter log for txHash ${createChainTransferDto.txHash}:`, deadLetterError);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
