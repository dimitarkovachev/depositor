import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, Min, MaxLength, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DepositStatus } from '../entities/deposit.entity';

export class CreateDepositDto {
  @ApiProperty({ description: 'Transaction hash', example: '0x1234567890abcdef' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^0x[a-fA-F0-9]{64}$/, { message: 'txHash must be a valid 64-character hex string starting with 0x' })
  txHash: string;

  @ApiProperty({ description: 'Blockchain network', example: 'ethereum' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  network: string;

  @ApiProperty({ description: 'Cryptocurrency asset', example: 'ETH' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  asset: string;

  @ApiProperty({ description: 'Transfer amount', example: 1.5 })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Sender address', example: '0xfrom123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'fromAddress must be a valid Ethereum address' })
  fromAddress: string;

  @ApiProperty({ description: 'Recipient address', example: '0xto456' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'toAddress must be a valid Ethereum address' })
  toAddress: string;

  @ApiProperty({ description: 'Number of confirmations', example: 12, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  confirmations?: number;

  @ApiProperty({ description: 'Deposit status', enum: DepositStatus, required: false })
  @IsOptional()
  @IsEnum(DepositStatus)
  status?: DepositStatus;

  @ApiProperty({ description: 'Merchant ID', example: 'merchant123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  merchantId: string;

  @ApiProperty({ description: 'Transaction timestamp', example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  occurredAt: string;
}
