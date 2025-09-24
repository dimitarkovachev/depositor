# Depositor API

A NestJS-based API for managing cryptocurrency deposits and chain transfers with webhook notifications.

## Features

- **Deposit Management**: Track cryptocurrency deposits with status updates
- **Chain Transfer Processing**: Handle blockchain transfers with confirmation thresholds
- **Webhook Notifications**: Send real-time notifications to merchant endpoints
- **Database Integration**: PostgreSQL with TypeORM for data persistence
- **API Documentation**: Swagger UI for easy testing and documentation

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Easy Run

```bash
docker-compose up -d --build
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/swagger
- **Database**: localhost:5432

### Environment Variables

Create a `local.env` file with:

```env
DB_CONNECTION_URL=postgres://postgres:postgres@postgres:5432/postgres?sslmode=disable
CONFIRMATION_THRESHOLD=12
NODE_ENV=development
```

## API Endpoints

### Health Check

#### Get API Status
```bash
curl -X GET "http://localhost:3000/" \
  -H "Content-Type: application/json"
```

#### Health Check
```bash
curl -X GET "http://localhost:3000/health" \
  -H "Content-Type: application/json"
```

### Deposits

#### Get All Deposits
```bash
curl -X GET "http://localhost:3000/deposits" \
  -H "Content-Type: application/json"
```

#### Get Deposits by Merchant
```bash
curl -X GET "http://localhost:3000/deposits?merchantId=merchant123" \
  -H "Content-Type: application/json"
```

### Chain Transfers

#### Create Chain Transfer
```bash
curl -X POST "http://localhost:3000/chain-transfer" \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x1234567890abcdef",
    "network": "ethereum",
    "asset": "ETH",
    "amount": "1.5",
    "fromAddress": "0x1111111111111111111111111111111111111111",
    "toAddress": "0x1111111111111111111111111111111111111112",
    "confirmations": 15,
    "occurredAt": "2024-01-15T10:30:00Z",
    "merchant": {
      "id": "merchant123",
      "webhookUrl": "https://merchant.com/webhook",
      "webhookSecret": "secret123"
    }
  }'
```

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start database
docker-compose up postgres -d

npm run start

# or just start both application container and postgres
docker-compose up -d --build

```

### Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run e2e
```

## Architecture

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data processing
- **Entities**: Database models with TypeORM
- **DTOs**: Data validation and transformation
- **Modules**: Feature-based organization

## Security Features

- Input validation with class-validator
- SQL injection protection via TypeORM
- Webhook signature verification (configurable)
- Environment-based configuration
- Database connection security

## Database Schema

### Deposits Table
- `txHash` (Primary Key): Transaction hash
- `network`: Blockchain network
- `asset`: Cryptocurrency asset
- `amount`: Transfer amount
- `fromAddress`: Sender address
- `toAddress`: Recipient address
- `confirmations`: Number of confirmations
- `status`: Deposit status (pending, inProgress, confirmed)
- `merchantId`: Associated merchant ID
- `occurredAt`: Transaction timestamp
- `createdAt`: Record creation time
- `updatedAt`: Record update time

## Webhook Integration

The API sends webhook notifications when deposits are confirmed:

```json
{
  "type": "deposit.updated",
  "txHash": "0x1234567890abcdef",
  "status": "confirmed",
  "asset": "ETH",
  "amount": "1.5",
  "toAddress": "0xto456",
  "confirmations": 15,
  "merchantId": "merchant123",
  "occurredAt": "2024-01-15T10:30:00Z"
}
```

## License

MIT