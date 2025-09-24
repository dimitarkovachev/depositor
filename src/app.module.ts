import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepositsModule } from './deposits/deposits.module';
import { Deposit } from './deposits/entities/deposit.entity';
import { ChainTransferModule } from './events/chain-transfer/chain-transfer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_CONNECTION_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
      entities: [Deposit],
      synchronize: process.env.NODE_ENV !== 'production', // Only for development
      logging: process.env.NODE_ENV === 'development',
    }),
    DepositsModule,
    ChainTransferModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
