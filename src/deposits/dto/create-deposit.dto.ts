import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, Min, MaxLength } from 'class-validator';
import { DepositStatus } from '../entities/deposit.entity';

export class CreateDepositDto {
  @IsString()
  @MaxLength(255)
  txHash: string;

  @IsString()
  @MaxLength(50)
  network: string;

  @IsString()
  @MaxLength(20)
  asset: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @MaxLength(255)
  fromAddress: string;

  @IsString()
  @MaxLength(255)
  toAddress: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  confirmations?: number;

  @IsOptional()
  @IsEnum(DepositStatus)
  status?: DepositStatus;

  @IsString()
  @MaxLength(255)
  merchantId: string;

  @IsDateString()
  occurredAt: string;
}
