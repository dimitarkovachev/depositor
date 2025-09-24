#!/usr/bin/env node

const axios = require('axios');
const WebhookServer = require('./e2e-webhook-server');

class E2ETest {
  constructor() {
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    this.webhookUrl = process.env.WEBHOOK_URL || 'http://127.0.0.1:3001/webhook';
    this.webhookServer = new WebhookServer(3001);
    this.merchantId = 'test-merchant-' + Date.now();
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async checkPortAvailability(port) {
    const net = require('net');
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.once('close', () => {
          resolve(true);
        });
        server.close();
      });
      server.on('error', () => {
        resolve(false);
      });
    });
  }

  async run() {
    console.log('🚀 Starting E2E Test Suite');
    console.log('============================');
    
    try {
      // Check if port 3001 is available
      const portAvailable = await this.checkPortAvailability(3001);
      if (!portAvailable) {
        throw new Error('Port 3001 is already in use. Please stop any services using this port and try again.');
      }
      
      // Start webhook server
      await this.webhookServer.start();
      console.log('✅ Webhook server started');
      
      // Verify server is actually running
      if (!this.webhookServer.isRunning()) {
        throw new Error('Webhook server failed to start properly');
      }
      
      // Wait a bit for server to be ready
      await this.delay(1000);
      
      // Test webhook server health
      await this.testWebhookServerHealth();
      
      // Run tests
      await this.testApiHealth();
      await this.testChainTransferFlow();
      await this.testDepositsEndpoint();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ E2E Test failed:', error.message);
      this.addTestResult('E2E Test Suite', false, error.message);
    } finally {
      // Cleanup
      await this.webhookServer.stop();
      console.log('🧹 Webhook server stopped');
    }
  }

  async testWebhookServerHealth() {
    console.log('\n🔗 Testing Webhook Server Health...');
    
    try {
      const response = await axios.get(`${this.webhookUrl.replace('/webhook', '')}/health`, { timeout: 5000 });
      
      if (response.status === 200 && response.data.status === 'ok') {
        console.log('✅ Webhook server is healthy');
        this.addTestResult('Webhook Server Health Check', true);
      } else {
        throw new Error(`Unexpected webhook server response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('❌ Webhook server health check failed:', error.message);
      this.addTestResult('Webhook Server Health Check', false, error.message);
      throw error;
    }
  }

  async testApiHealth() {
    console.log('\n📡 Testing API Health...');
    
    try {
      const response = await axios.get(`${this.apiBaseUrl}/health`, { timeout: 5000 });
      
      if (response.status === 200 && response.data.status === 'ok') {
        console.log('✅ API is healthy');
        this.addTestResult('API Health Check', true);
      } else {
        throw new Error(`Unexpected health response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('❌ API health check failed:', error.message);
      this.addTestResult('API Health Check', false, error.message);
      throw error;
    }
  }

  async testChainTransferFlow() {
    console.log('\n🔄 Testing Chain Transfer Flow...');
    
    const testTransactions = [
      {
        txHash: '0x1234567890abcdef1234567890abcdef12345678',
        network: 'ethereum',
        asset: 'ETH',
        amount: '1.5',
        fromAddress: '0x1111111111111111111111111111111111111111',
        toAddress: '0x2222222222222222222222222222222222222222',
        confirmations: 15,
        occurredAt: new Date().toISOString(),
        merchant: {
          id: this.merchantId,
          webhookUrl: this.webhookUrl,
          webhookSecret: 'test-secret-123'
        }
      },
      {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        network: 'ethereum',
        asset: 'USDC',
        amount: '100.0',
        fromAddress: '0x3333333333333333333333333333333333333333',
        toAddress: '0x4444444444444444444444444444444444444444',
        confirmations: 18,
        occurredAt: new Date().toISOString(),
        merchant: {
          id: this.merchantId,
          webhookUrl: this.webhookUrl,
          webhookSecret: 'test-secret-123'
        }
      },
      {
        txHash: '0x9876543210fedcba9876543210fedcba98765432',
        network: 'polygon',
        asset: 'MATIC',
        amount: '50.25',
        fromAddress: '0x5555555555555555555555555555555555555555',
        toAddress: '0x6666666666666666666666666666666666666666',
        confirmations: 20,
        occurredAt: new Date().toISOString(),
        merchant: {
          id: this.merchantId,
          webhookUrl: this.webhookUrl,
          webhookSecret: 'test-secret-123'
        }
      }
    ];

    // Clear previous webhooks
    await this.webhookServer.clearWebhooks();

    // Send chain transfer requests
    for (let i = 0; i < testTransactions.length; i++) {
      const tx = testTransactions[i];
      console.log(`📤 Sending chain transfer ${i + 1}/${testTransactions.length}: ${tx.txHash}`);
      
      try {
        const response = await axios.post(`${this.apiBaseUrl}/chain-transfer`, tx, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        
        if (response.status === 200 || response.status === 201) {
          console.log(`✅ Chain transfer ${i + 1} sent successfully`);
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Failed to send chain transfer ${i + 1}:`, error.message);
        this.addTestResult(`Chain Transfer ${i + 1}`, false, error.message);
        continue;
      }
    }

    // Wait for webhooks
    console.log('⏳ Waiting for webhook callbacks...');
    try {
      const webhooks = await this.webhookServer.waitForWebhooks(testTransactions.length, 30000);
      console.log(`✅ Received ${webhooks.length} webhook callbacks`);
      
      // Validate webhook payloads
      await this.validateWebhookPayloads(webhooks, testTransactions);
      
    } catch (error) {
      console.error('❌ Webhook validation failed:', error.message);
      this.addTestResult('Webhook Reception', false, error.message);
    }
  }

  async validateWebhookPayloads(receivedWebhooks, expectedTransactions) {
    console.log('\n🔍 Validating webhook payloads...');
    
    if (receivedWebhooks.length !== expectedTransactions.length) {
      throw new Error(`Expected ${expectedTransactions.length} webhooks, received ${receivedWebhooks.length}`);
    }

    for (let i = 0; i < receivedWebhooks.length; i++) {
      const webhook = receivedWebhooks[i];
      const payload = webhook.payload;
      
      console.log(`🔍 Validating webhook ${i + 1}:`);
      console.log(`   Type: ${payload.type}`);
      console.log(`   TxHash: ${payload.txHash}`);
      console.log(`   Status: ${payload.status}`);
      console.log(`   Merchant ID: ${payload.merchantId}`);
      
      // Validate webhook structure
      const requiredFields = ['type', 'txHash', 'status', 'asset', 'amount', 'toAddress', 'confirmations', 'merchantId', 'occurredAt'];
      for (const field of requiredFields) {
        if (!payload[field]) {
          throw new Error(`Missing required field in webhook: ${field}`);
        }
      }
      
      // Validate webhook content
      if (payload.type !== 'deposit.updated') {
        throw new Error(`Invalid webhook type: ${payload.type}`);
      }
      
      if (payload.status !== 'confirmed') {
        throw new Error(`Invalid webhook status: ${payload.status}`);
      }
      
      if (payload.merchantId !== this.merchantId) {
        throw new Error(`Invalid merchant ID: ${payload.merchantId}`);
      }
      
      // Find corresponding transaction
      const expectedTx = expectedTransactions.find(tx => tx.txHash === payload.txHash);
      if (!expectedTx) {
        throw new Error(`Webhook for unknown transaction: ${payload.txHash}`);
      }
      
      // Validate webhook data matches transaction
      if (payload.asset !== expectedTx.asset) {
        throw new Error(`Asset mismatch: expected ${expectedTx.asset}, got ${payload.asset}`);
      }
      
      if (payload.amount !== expectedTx.amount) {
        throw new Error(`Amount mismatch: expected ${expectedTx.amount}, got ${payload.amount}`);
      }
      
      if (payload.toAddress !== expectedTx.toAddress) {
        throw new Error(`ToAddress mismatch: expected ${expectedTx.toAddress}, got ${payload.toAddress}`);
      }
      
      console.log(`✅ Webhook ${i + 1} validation passed`);
    }
    
    this.addTestResult('Webhook Validation', true);
  }

  async testDepositsEndpoint() {
    console.log('\n💰 Testing Deposits Endpoint...');
    
    try {
      // Test deposits endpoint with merchant filter
      const response = await axios.get(`${this.apiBaseUrl}/deposits?merchantId=${this.merchantId}`, {
        timeout: 10000
      });
      
      if (response.status !== 200) {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
      
      const deposits = response.data;
      console.log(`📊 Found ${deposits.length} deposits for merchant ${this.merchantId}`);
      
      if (deposits.length === 0) {
        throw new Error('No deposits found for merchant');
      }
      
      // Validate deposit structure and status
      for (let i = 0; i < deposits.length; i++) {
        const deposit = deposits[i];
        console.log(`🔍 Validating deposit ${i + 1}:`);
        console.log(`   TxHash: ${deposit.txHash}`);
        console.log(`   Status: ${deposit.status}`);
        console.log(`   Merchant ID: ${deposit.merchantId}`);
        console.log(`   Asset: ${deposit.asset}`);
        console.log(`   Amount: ${deposit.amount}`);
        
        // Validate required fields
        const requiredFields = ['txHash', 'network', 'asset', 'amount', 'fromAddress', 'toAddress', 'confirmations', 'status', 'merchantId', 'occurredAt'];
        for (const field of requiredFields) {
          if (deposit[field] === undefined || deposit[field] === null) {
            throw new Error(`Missing required field in deposit: ${field}`);
          }
        }
        
        // Validate merchant ID
        if (deposit.merchantId !== this.merchantId) {
          throw new Error(`Invalid merchant ID in deposit: ${deposit.merchantId}`);
        }
        
        // Validate status is confirmed (webhook was successful)
        if (deposit.status !== 'confirmed') {
          throw new Error(`Deposit status should be 'confirmed' but got: ${deposit.status}`);
        }
        
        console.log(`✅ Deposit ${i + 1} validation passed`);
      }
      
      console.log('✅ All deposits validated successfully');
      this.addTestResult('Deposits Endpoint', true);
      
    } catch (error) {
      console.error('❌ Deposits endpoint test failed:', error.message);
      this.addTestResult('Deposits Endpoint', false, error.message);
      throw error;
    }
  }

  addTestResult(testName, passed, error = null) {
    this.testResults.tests.push({
      name: testName,
      passed,
      error: error || null
    });
    
    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
  }

  printResults() {
    console.log('\n📊 Test Results');
    console.log('================');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Total: ${this.testResults.tests.length}`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.error}`);
        });
    }
    
    const success = this.testResults.failed === 0;
    console.log(`\n${success ? '🎉 All tests passed!' : '💥 Some tests failed!'}`);
    
    process.exit(success ? 0 : 1);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const test = new E2ETest();
  test.run().catch(error => {
    console.error('💥 E2E Test crashed:', error);
    process.exit(1);
  });
}

module.exports = E2ETest;
