import { parse } from 'csv-parse/sync';
import { AppError } from '../middleware/errorHandler';

export class CsvParser {
  static parse(fileBuffer: Buffer): Record<string, string>[] {
    try {
      const records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      this.validateRecords(records);
      return records;
    } catch (error) {
      throw new AppError(
        400,
        `CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private static validateRecords(records: any[]): void {
    if (!records || records.length === 0) {
      throw new AppError(400, 'CSV file is empty');
    }
  }

  static formatRecordsForPrompt(records: Record<string, string>[]): string {
    if (records.length === 0) {
      return '';
    }

    // Get headers from first record
    const headers = Object.keys(records[0]);
    const header = headers.join(',');
    
    // Format rows
    const rows = records
      .map((record) =>
        headers
          .map((key) => {
            const value = record[key];
            // Escape values containing commas or quotes
            if (value.includes(',') || value.includes('"')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      )
      .join('\n');
    
    return header + '\n' + rows;
  }
}
