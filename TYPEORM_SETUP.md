# TypeORM Setup Guide

## Overview

This project now uses TypeORM with PostgreSQL for database operations. TypeORM is a powerful Object-Relational Mapping (ORM) library that allows you to work with databases using TypeScript/JavaScript objects instead of raw SQL queries.

## What is TypeORM?

TypeORM is an ORM that can run in Node.js, Browser, Cordova, PhoneGap, Ionic, React Native, NativeScript, Expo, and Electron platforms and can be used with TypeScript and JavaScript. It supports both Active Record and Data Mapper patterns.

## Key Features Implemented

### 1. Entity Definition
The `Deposit` entity is defined with TypeORM decorators:

```typescript
@Entity('deposits')
export class Deposit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  txHash: string;
  
  // ... other fields
}
```

### 2. Database Configuration
TypeORM is configured in `app.module.ts` with PostgreSQL connection:

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'depositor',
  entities: [Deposit],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
})
```

### 3. Repository Pattern
The service uses TypeORM's Repository pattern for database operations:

```typescript
@Injectable()
export class DepositsService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>,
  ) {}
}
```

## Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=depositor

# Application
NODE_ENV=development
```

## Database Setup

1. **Install PostgreSQL** (if not already installed)
2. **Create the database**:
   ```sql
   CREATE DATABASE depositor;
   ```
3. **Start the application** - TypeORM will automatically create tables based on your entities (when `synchronize: true`)

## Available API Endpoints

### Basic CRUD Operations
- `POST /deposits` - Create a new deposit
- `GET /deposits` - Get all deposits (with optional merchantId filter)
- `GET /deposits/:id` - Get deposit by ID
- `PATCH /deposits/:id` - Update deposit
- `DELETE /deposits/:id` - Delete deposit

### Specialized Queries
- `GET /deposits/by-tx-hash/:txHash` - Find by transaction hash
- `GET /deposits/by-merchant/:merchantId` - Find by merchant ID
- `GET /deposits/by-status/:status` - Find by status (pending/inProgress/confirmed)
- `GET /deposits/by-network/:network` - Find by network
- `GET /deposits/by-asset/:asset` - Find by asset
- `GET /deposits/by-address/:address` - Find by address (fromAddress or toAddress)
- `GET /deposits/stats` - Get statistics

### Status Management
- `PATCH /deposits/:id/status` - Update deposit status
- `PATCH /deposits/:id/confirmations` - Update confirmations (auto-updates status)

## TypeORM Decorators Used

### Entity Decorators
- `@Entity('table_name')` - Marks class as database entity
- `@PrimaryGeneratedColumn()` - Auto-incrementing primary key
- `@Column(options)` - Regular database column
- `@CreateDateColumn()` - Automatically sets creation timestamp
- `@UpdateDateColumn()` - Automatically updates timestamp

### Column Options
- `type: 'varchar'` - String type
- `length: 255` - Maximum length
- `type: 'decimal'` - Decimal number
- `precision: 18, scale: 8` - Decimal precision
- `type: 'enum'` - Enum type
- `default: value` - Default value
- `nullable: true/false` - Nullable constraint

## Repository Methods Available

The service provides these ready-to-use methods:

### Basic Operations
- `create(dto)` - Create new deposit
- `findAll(merchantId?)` - Get all deposits
- `findOne(id)` - Get deposit by ID
- `update(id, dto)` - Update deposit
- `remove(id)` - Delete deposit

### Query Methods
- `findByTxHash(txHash)` - Find by transaction hash
- `findByMerchantId(merchantId)` - Find by merchant
- `findByStatus(status)` - Find by status
- `findByNetwork(network)` - Find by network
- `findByAsset(asset)` - Find by asset
- `findByAddress(address)` - Find by address

### Status Management
- `updateStatus(id, status)` - Update status
- `updateConfirmations(id, confirmations)` - Update confirmations with auto-status

### Analytics
- `getStats(merchantId?)` - Get statistics (counts and totals)

## How TypeORM Works

1. **Code First Approach**: You define entities in TypeScript, and TypeORM generates the database schema
2. **Active Record Pattern**: Entities can have methods to perform database operations
3. **Repository Pattern**: Services use repositories to perform database operations
4. **Automatic Migrations**: When `synchronize: true`, TypeORM automatically creates/updates tables
5. **Query Builder**: Complex queries using TypeScript instead of raw SQL

## Example Usage

### Creating a Deposit
```typescript
const deposit = await depositsService.create({
  txHash: '0x123...',
  network: 'ethereum',
  asset: 'ETH',
  amount: 1.5,
  fromAddress: '0xabc...',
  toAddress: '0xdef...',
  merchantId: 'merchant123',
  occurredAt: '2024-01-01T00:00:00Z'
});
```

### Querying Deposits
```typescript
// Get all pending deposits
const pending = await depositsService.findByStatus(DepositStatus.PENDING);

// Get deposits for a specific merchant
const merchantDeposits = await depositsService.findByMerchantId('merchant123');

// Get statistics
const stats = await depositsService.getStats('merchant123');
```

## Production Considerations

1. **Set `synchronize: false`** in production
2. **Use migrations** for schema changes
3. **Configure connection pooling**
4. **Set up proper logging**
5. **Use environment variables** for all configuration

## Next Steps

1. Set up your PostgreSQL database
2. Configure environment variables
3. Run the application to create tables
4. Start using the API endpoints
5. Consider adding migrations for production deployment
