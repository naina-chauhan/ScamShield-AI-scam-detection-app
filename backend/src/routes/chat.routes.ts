import { Router } from 'express';
import {
  chatWithAI,
  getChatSessions,
  getChatSession,
  deleteChatSession,
  updateChatTitle,
  translateMessage,
  textToVoice,
} from '../controllers/chat.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

// Chat endpoints
router.post('/', chatWithAI);
router.post('/translate', translateMessage);
router.post('/text-to-voice', textToVoice);

// Chat history endpoints
router.get('/sessions', getChatSessions);
router.get('/sessions/:sessionId', getChatSession);
router.delete('/sessions/:sessionId', deleteChatSession);
router.put('/sessions/:sessionId/title', updateChatTitle);

export default router;
