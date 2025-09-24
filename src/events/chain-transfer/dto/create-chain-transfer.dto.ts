import { IsString, IsNumber, IsDateString, IsObject, ValidateNested, IsOptional, Min, MaxLength, IsNotEmpty, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MerchantDto {
  @ApiProperty({ description: 'Merchant ID', example: 'merchant123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  id: string;

  @ApiProperty({ description: 'Webhook URL', example: 'https://merchant.com/webhook' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  webhookUrl: string;

  @ApiProperty({ description: 'Webhook secret for authentication', example: 'secret123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  webhookSecret: string;
}

export class CreateChainTransferDto {
  @ApiProperty({ description: 'Transaction hash', example: '0x1234567890abcdef' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^0x[a-fA-F0-9]+$/, { message: 'txHash must be a valid hex string starting with 0x' })
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

  @ApiProperty({ description: 'Transfer amount as string', example: '1.5' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,8})?$/, { message: 'amount must be a valid decimal number with up to 8 decimal places' })
  amount: string;

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

  @ApiProperty({ description: 'Number of confirmations', example: 15 })
  @IsNumber()
  @Min(0)
  confirmations: number;

  @ApiProperty({ description: 'Transaction timestamp', example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  occurredAt: string;

  @ApiProperty({ description: 'Merchant information', type: MerchantDto })
  @IsObject()
  @ValidateNested()
  @Type(() => MerchantDto)
  merchant: MerchantDto;
}
