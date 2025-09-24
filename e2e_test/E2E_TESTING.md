# E2E Testing Documentation

This document describes the end-to-end testing setup for the Depositor API.

## Overview

The E2E test suite validates the complete flow of the Depositor API:

1. **Chain Transfer Processing**: Sends POST requests to `/chain-transfer` endpoint
2. **Webhook Notifications**: Verifies that webhook callbacks are sent to merchant endpoints
3. **Deposit Management**: Checks that deposits are created and updated with correct status
4. **API Integration**: Tests the `/deposits` endpoint with merchant filtering

## Test Architecture

### Components

1. **Main Application**: The NestJS Depositor API (port 3000)
2. **Webhook Server**: Standalone Node.js server (port 3001) that receives webhook callbacks
3. **E2E Test Script**: Orchestrates the entire test flow
4. **PostgreSQL**: Database for data persistence

### Test Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   E2E Test      │    │  Depositor API   │    │ Webhook Server  │
│                 │    │   (port 3000)    │    │   (port 3001)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. POST /chain-transfer                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │                       │ 2. Process & Create   │
         │                       │    Deposit            │
         │                       │                       │
         │                       │ 3. Send Webhook       │
         │                       ├──────────────────────►│
         │                       │                       │
         │ 4. GET /deposits?merchantId=xxx                │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 5. Validate Response  │                       │
         │◄──────────────────────┤                       │
```

