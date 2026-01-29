import OpenAI from 'openai';
import { config } from '../config/config';
import { BankTransaction, AnalysisResult } from '../types';
import { AppError } from '../middleware/errorHandler';
import { readFileSync } from 'fs';
import { join } from 'path';

export class OpenAIService {
  private client: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.systemPrompt = this.loadPrompt();
  }

  private loadPrompt(): string {
    try {
      const promptPath = join(__dirname, '../../optimized_prompt.txt');
      return readFileSync(promptPath, 'utf-8');
    } catch (error) {
      throw new Error('Failed to load system prompt');
    }
  }

  async analyzeTransactions(
    transactions: BankTransaction[]
  ): Promise<AnalysisResult> {
    try {
      const transactionsData = this.formatTransactions(transactions);
      const prompt = this.systemPrompt.replace(
        '{{STATEMENT_DATA}}',
        transactionsData
      );

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Low temperature for consistency
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError(500, 'No response from OpenAI');
      }

      const result = JSON.parse(content) as AnalysisResult;
      return this.validateResult(result);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        500,
        `OpenAI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private formatTransactions(transactions: BankTransaction[]): string {
    return transactions
      .map(
        (t) =>
          `${t.date} | ${t.description} | ${t.type === 'debit' ? '-' : '+'}${Math.abs(t.amount).toFixed(2)} | Balance: ${t.balance.toFixed(2)}`
      )
      .join('\n');
  }

  private validateResult(result: any): AnalysisResult {
    // Basic validation - ensure required fields exist
    if (!result.summary || !result.categoryBreakdown) {
      throw new AppError(500, 'Invalid response structure from OpenAI');
    }
    return result;
  }
}
