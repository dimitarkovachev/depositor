#!/usr/bin/env node

const http = require('http');
const url = require('url');

class WebhookServer {
  constructor(port = 3001) {
    this.port = port;
    this.server = null;
    this.receivedWebhooks = [];
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = http.createServer((req, res) => {
          // Add error handling for response object
          if (!res || typeof res.writeHead !== 'function') {
            console.error('Invalid response object received');
            return;
          }

          try {
            if (req.method === 'POST' && req.url === '/webhook') {
              this.handleWebhook(req, res);
            } else if (req.method === 'GET' && req.url === '/webhooks') {
              this.getWebhooks(req, res);
            } else if (req.method === 'GET' && req.url === '/health') {
              this.healthCheck(req, res);
            } else if (req.method === 'POST' && req.url === '/clear') {
              this.clearWebhooks(req, res);
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Not found' }));
            }
          } catch (error) {
            console.error('Error handling request:', error);
            if (res && typeof res.writeHead === 'function') {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal server error' }));
            }
          }
        });

        // Add error handlers
        this.server.on('error', (err) => {
          console.error('Server error:', err);
          reject(err);
        });

        this.server.on('clientError', (err, socket) => {
          console.error('Client error:', err);
          socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });

        this.server.listen(this.port, (err) => {
          if (err) {
            console.error('Failed to start server:', err);
            reject(err);
          } else {
            console.log(`Webhook server listening on port ${this.port}`);
            resolve();
          }
        });
      } catch (error) {
        console.error('Failed to create server:', error);
        reject(error);
      }
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(resolve);
      } else {
        resolve();
      }
    });
  }

  handleWebhook(req, res) {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const webhookData = {
          timestamp: new Date().toISOString(),
          headers: req.headers,
          payload: payload
        };
        
        this.receivedWebhooks.push(webhookData);
        console.log(`Received webhook:`, JSON.stringify(payload, null, 2));
        
        if (res && typeof res.writeHead === 'function') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'received' }));
        }
      } catch (error) {
        console.error('Error parsing webhook payload:', error);
        if (res && typeof res.writeHead === 'function') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      }
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      if (res && typeof res.writeHead === 'function') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request error' }));
      }
    });
  }

  getWebhooks(req, res) {
    if (res && typeof res.writeHead === 'function') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        count: this.receivedWebhooks.length,
        webhooks: this.receivedWebhooks
      }));
    }
  }

  clearWebhooks(req, res) {
    this.receivedWebhooks = [];
    if (res && typeof res.writeHead === 'function') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Webhooks cleared' }));
    }
  }

  healthCheck(req, res) {
    if (res && typeof res.writeHead === 'function') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', port: this.port }));
    }
  }

  getReceivedWebhooks() {
    return this.receivedWebhooks;
  }

  isRunning() {
    return this.server && this.server.listening;
  }

  waitForWebhooks(count, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkInterval = setInterval(() => {
        if (this.receivedWebhooks.length >= count) {
          clearInterval(checkInterval);
          resolve(this.receivedWebhooks);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error(`Timeout waiting for ${count} webhooks. Received ${this.receivedWebhooks.length}`));
        }
      }, 100);
    });
  }
}

// If running directly, start the server
if (require.main === module) {
  const server = new WebhookServer(process.env.PORT || 3001);
  server.start().catch(console.error);
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down webhook server...');
    await server.stop();
    process.exit(0);
  });
}

module.exports = WebhookServer;
