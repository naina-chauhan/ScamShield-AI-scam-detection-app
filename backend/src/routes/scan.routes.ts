import { Router } from 'express';
import {
  analyzeMessage,
  analyzeEmailFile,
  analyzeVoice,
  getHistory,
  getScanDetail,
  downloadPDFReport,
  getScanStats,
  deleteScan,
} from '../controllers/scan.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadEmail, uploadAudio } from '../middleware/upload.middleware.js';

const router = Router();

// All scan routes require authentication
router.use(authMiddleware);

// Analysis endpoints
router.post('/analyze', analyzeMessage);
router.post('/analyze-email', uploadEmail, analyzeEmailFile);
router.post('/analyze-voice', uploadAudio, analyzeVoice);

// History endpoints
router.get('/history', getHistory);
router.get('/history/:scanId', getScanDetail);
router.delete('/history/:scanId', deleteScan);

// Report endpoints
router.get('/report/:scanId/pdf', downloadPDFReport);

// Statistics
router.get('/stats', getScanStats);

export default router;
