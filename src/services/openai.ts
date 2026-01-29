import OpenAI from 'openai';
import { config } from '../config/config';
import { AnalysisResult } from '../types';
import { AppError } from '../middleware/errorHandler';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CsvParser } from './csvParser';

export class OpenAIService {
  private client: OpenAI;
  private systemPrompt: string;
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

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

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async analyzeTransactions(
    csvRecords: Record<string, string>[]
  ): Promise<AnalysisResult> {
    const csvData = CsvParser.formatRecordsForPrompt(csvRecords);
    const prompt = this.systemPrompt.replace(
      '{{STATEMENT_DATA}}',
      csvData
    );

    const messageContent = `${prompt}`;

    // Retry logic with exponential backoff
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`OpenAI API attempt ${attempt}/${this.MAX_RETRIES}`);

        const response = await this.client.chat.completions.create({
          model: config.openai.model,
          messages: [
            {
              role: 'user',
              content: messageContent,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No response content from OpenAI');
        }

        // Validate JSON before returning
        const result = JSON.parse(content) as AnalysisResult;
        this.validateResult(result);

        console.log('OpenAI analysis successful');
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message;

        // Determine if error is retryable
        const isRetryable =
          errorMessage.includes('timeout') ||
          errorMessage.includes('429') || // Rate limit
          errorMessage.includes('500') ||
          errorMessage.includes('503') || // Service unavailable
          errorMessage.includes('Unexpected end of JSON input'); // Parsing error

        if (attempt < this.MAX_RETRIES && isRetryable) {
          const delayMs = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
          console.warn(
            `Attempt ${attempt} failed (${errorMessage}). Retrying in ${delayMs}ms...`
          );
          await this.sleep(delayMs);
        } else if (attempt === this.MAX_RETRIES) {
          console.error(`All ${this.MAX_RETRIES} retry attempts failed`);
          break;
        } else {
          // Non-retryable error
          console.error(`Non-retryable error: ${errorMessage}`);
          break;
        }
      }
    }

    // All retries failed
    if (lastError instanceof AppError) {
      throw lastError;
    }

    throw new AppError(
      500,
      `OpenAI analysis failed after ${this.MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`
    );
  }

  private validateResult(result: any): AnalysisResult {
    // Basic validation - ensure required fields exist
    if (!result.summary || !result.categoryBreakdown) {
      throw new AppError(500, 'Invalid response structure from OpenAI');
    }
    return result;
  }
}
