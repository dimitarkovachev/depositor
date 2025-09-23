import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';

export enum DepositStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'inProgress',
  CONFIRMED = 'confirmed',
}

@Entity('deposits')
export class Deposit {
  @PrimaryColumn({ type: 'varchar', length: 255, unique: true })
  txHash: string;

  @Column({ type: 'varchar', length: 50 })
  network: string;

  @Column({ type: 'varchar', length: 20 })
  asset: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  fromAddress: string;

  @Column({ type: 'varchar', length: 255 })
  toAddress: string;

  @Column({ type: 'int', default: 0 })
  confirmations: number;

  @Column({
    type: 'enum',
    enum: DepositStatus,
    default: DepositStatus.PENDING,
  })
  status: DepositStatus;

  @Column({ type: 'varchar', length: 255 })
  merchantId: string;

  @Column({ type: 'timestamp' })
  occurredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
