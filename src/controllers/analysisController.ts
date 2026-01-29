import { Request, Response } from 'express';
import { CsvParser } from '../services/csvParser';
import { OpenAIService } from '../services/openai';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../middleware/errorHandler';
import { AnalysisResult } from '../types';

const openAIService = new OpenAIService();

export const analyzeStatement = asyncHandler(
  async (req: Request, res: Response<AnalysisResult>): Promise<void> => {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    // Parse CSV
    const csvRecords = CsvParser.parse(req.file.buffer);

    if (csvRecords.length === 0) {
      throw new AppError(400, 'No valid records found in CSV');
    }

    // Analyze with OpenAI
    const analysis = await openAIService.analyzeTransactions(csvRecords);

    res.json(analysis);
  }
);

export const healthCheck = (req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
};
