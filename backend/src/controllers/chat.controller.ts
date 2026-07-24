import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { chatWithAIService, translateText } from '../services/ai.service.js';
import { textToSpeech } from '../services/voice.service.js';
import ChatHistory from '../models/ChatHistory.js';
import { v4 as uuidv4 } from 'uuid';

const ChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(5000),
    })
  ).min(1).max(50),
  sessionId: z.string().optional(),
  language: z.string().optional(),
  saveHistory: z.boolean().optional(),
});

/**
 * Chat with AI (streaming response)
 */
export const chatWithAI = async (req: AuthRequest, res: Response) => {
  try {
    const { messages, sessionId, language = 'en', saveHistory = true } = ChatSchema.parse(req.body);

    // Set up SSE (Server-Sent Events) for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';

    // Stream AI response
    await chatWithAIService(messages, language, (chunk) => {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    });

    res.write('data: [DONE]\n\n');

    // Save chat history if enabled
    if (saveHistory && fullResponse) {
      try {
        const chatSessionId = sessionId || uuidv4();
        
        // Find or create chat session
        let chatSession = await ChatHistory.findOne({
          userId: req.userId,
          sessionId: chatSessionId,
        });

        const newMessages = [
          ...messages,
          {
            role: 'assistant' as const,
            content: fullResponse,
            timestamp: new Date(),
          },
        ];

        if (chatSession) {
          // Update existing session
          chatSession.messages.push(...newMessages);
          await chatSession.save();
        } else {
          // Create new session
          const title = messages[0].content.substring(0, 50) + (messages[0].content.length > 50 ? '...' : '');
          
          await ChatHistory.create({
            userId: req.userId,
            sessionId: chatSessionId,
            messages: newMessages,
            title,
            language,
          });
        }
      } catch (dbError) {
        console.error('Failed to save chat history:', dbError);
      }
    }

    res.end();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Chat error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ error: 'Chat failed' });
    }
  }
};

/**
 * Get chat history sessions
 */
export const getChatSessions = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const sessions = await ChatHistory.find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip(offset)
      .select('sessionId title language createdAt updatedAt')
      .lean();

    const total = await ChatHistory.countDocuments({ userId: req.userId });

    res.json({
      sessions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Failed to get chat sessions' });
  }
};

/**
 * Get specific chat session with messages
 */
export const getChatSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatHistory.findOne({
      userId: req.userId,
      sessionId,
    }).lean();

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({ error: 'Failed to get chat session' });
  }
};

/**
 * Delete chat session
 */
export const deleteChatSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;

    const result = await ChatHistory.deleteOne({
      userId: req.userId,
      sessionId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
};

/**
 * Update chat session title
 */
export const updateChatTitle = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { title } = z.object({ title: z.string().min(1).max(100) }).parse(req.body);

    const session = await ChatHistory.findOneAndUpdate(
      {
        userId: req.userId,
        sessionId,
      },
      { title },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({ message: 'Title updated successfully', session });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update chat title error:', error);
    res.status(500).json({ error: 'Failed to update title' });
  }
};

/**
 * Translate message to different language
 */
export const translateMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { text, targetLanguage } = z.object({
      text: z.string().min(1).max(5000),
      targetLanguage: z.string().min(2).max(10),
    }).parse(req.body);

    const translatedText = await translateText(text, targetLanguage);

    res.json({ translatedText });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
};

/**
 * Convert text to speech (voice output)
 */
export const textToVoice = async (req: AuthRequest, res: Response) => {
  try {
    const { text, languageCode = 'en-US' } = z.object({
      text: z.string().min(1).max(1000),
      languageCode: z.string().optional(),
    }).parse(req.body);

    const audioBuffer = await textToSpeech(text, languageCode);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename=response.mp3');
    res.send(audioBuffer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Voice synthesis failed' });
  }
};
