import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DeadLetterLogService {
  private readonly logger = new Logger(DeadLetterLogService.name);
  private readonly logFilePath = path.join(process.cwd(), 'dead_letter_log.log');

  /**
   * Writes a dead letter log entry with transaction ID and current UTC timestamp
   * @param transactionId - The transaction ID to log
   */
  async write(transactionId: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = `${timestamp} - Transaction ID: ${transactionId}\n`;
      
      // Append to the log file
      await fs.promises.appendFile(this.logFilePath, logEntry, 'utf8');
      
      this.logger.log(`Dead letter log entry written for transaction ID: ${transactionId}`);
    } catch (error) {
      this.logger.error(`Failed to write dead letter log for transaction ID ${transactionId}:`, error);
      throw error;
    }
  }
}
