import { Router } from 'express';
import { upload } from '../middleware/upload';
import { analyzeStatement, healthCheck } from '../controllers/analysisController';

const router = Router();

/**
 * POST /api/analyze
 * Analyzes a bank statement CSV file
 * Content-Type: multipart/form-data
 * Field name: statement
 */
router.post('/analyze', upload.single('statement'), analyzeStatement);

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', healthCheck);

export default router;
