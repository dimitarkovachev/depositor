import { PartialType } from '@nestjs/mapped-types';
import { CreateChainTransferDto } from './create-chain-transfer.dto';

export class UpdateChainTransferDto extends PartialType(CreateChainTransferDto) {}
