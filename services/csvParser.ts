import { parse } from 'csv-parse/sync';
import { BankTransaction } from '../types';
import { AppError } from '../middleware/errorHandler';

export class CsvParser {
  static parse(fileBuffer: Buffer): BankTransaction[] {
    try {
      const records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      return this.validateAndTransform(records);
    } catch (error) {
      throw new AppError(
        400,
        `CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private static validateAndTransform(records: any[]): BankTransaction[] {
    if (!records || records.length === 0) {
      throw new AppError(400, 'CSV file is empty');
    }

    const requiredColumns = ['date', 'description', 'amount', 'type', 'balance'];
    const firstRecord = records[0];
    const missingColumns = requiredColumns.filter(
      (col) => !(col in firstRecord)
    );

    if (missingColumns.length > 0) {
      throw new AppError(
        400,
        `CSV is missing required columns: ${missingColumns.join(', ')}`
      );
    }

    return records.map((record, index) => {
      try {
        const amount = parseFloat(record.amount);
        const balance = parseFloat(record.balance);

        if (isNaN(amount) || isNaN(balance)) {
          throw new Error(`Invalid numeric value at row ${index + 2}`);
        }

        if (!['credit', 'debit'].includes(record.type)) {
          throw new Error(
            `Invalid transaction type "${record.type}" at row ${index + 2}`
          );
        }

        if (!this.isValidDate(record.date)) {
          throw new Error(`Invalid date format at row ${index + 2}`);
        }

        return {
          date: record.date,
          description: record.description.trim(),
          amount,
          type: record.type as 'credit' | 'debit',
          balance,
        };
      } catch (error) {
        throw new AppError(
          400,
          `Invalid data in CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  static formatTransactionsForPrompt(transactions: BankTransaction[]): string {
    const header = 'Date,Description,Amount,Type,Balance\n';
    const rows = transactions
      .map(
        (t) =>
          `${t.date},${t.description},${t.amount.toFixed(2)},${t.type},${t.balance.toFixed(2)}`
      )
      .join('\n');
    return header + rows;
  }
}
