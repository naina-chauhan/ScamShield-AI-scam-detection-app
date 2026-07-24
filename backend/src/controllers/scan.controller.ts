import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { analyzeWithAI } from '../services/ai.service.js';
import { parseEmailFile, analyzeEmailHeaders, extractEmailText } from '../services/email.service.js';
import { speechToText } from '../services/voice.service.js';
import { generatePDFReport } from '../services/pdf.service.js';
import ScanHistory from '../models/ScanHistory.js';
import User from '../models/User.js';

const AnalyzeSchema = z.object({
  scan_type: z.enum(['text', 'url', 'email']),
  input: z.string().min(1).max(10000),
  privacy_mode: z.boolean().optional(),
  language: z.string().optional(),
});

/**
 * Analyze message/URL/email for scam detection
 */
export const analyzeMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { scan_type, input, privacy_mode, language } = AnalyzeSchema.parse(req.body);

    // Perform AI analysis
    const analysis = await analyzeWithAI(scan_type, input);

    // Save to database if not in privacy mode
    if (!privacy_mode) {
      try {
        await ScanHistory.create({
          userId: req.userId,
          scanType: scan_type,
          inputText: input,
          status: analysis.status,
          confidence: analysis.confidence,
          explanation: analysis.explanation,
          detailedReasoning: analysis.detailedReasoning,
          scamCategory: analysis.scamCategory,
          suspiciousWords: analysis.suspiciousWords,
          privacyMode: false,
          language: analysis.language,
          embedding: analysis.embedding,
        });
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Continue even if DB save fails
      }
    }

    res.json(analysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

/**
 * Analyze email file (.eml format)
 */
export const analyzeEmailFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No email file uploaded' });
    }

    // Parse email file
    const emailData = await parseEmailFile(req.file.buffer);
    
    // Analyze email headers
    const headerAnalysis = analyzeEmailHeaders(emailData);
    
    // Extract full text for AI analysis
    const emailText = extractEmailText(emailData);
    
    // Perform AI analysis
    const analysis = await analyzeWithAI('email', emailText);

    // Combine header analysis with AI analysis
    const combinedReasoning = [
      ...analysis.detailedReasoning,
      ...headerAnalysis.suspiciousIndicators,
    ];

    // Adjust confidence based on header analysis
    const adjustedConfidence = Math.min(
      100,
      Math.round((analysis.confidence + headerAnalysis.riskScore) / 2)
    );

    const finalResult = {
      ...analysis,
      confidence: adjustedConfidence,
      detailedReasoning: combinedReasoning,
      emailMetadata: {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        date: emailData.date,
        attachmentCount: emailData.attachments?.length || 0,
      },
    };

    // Save to database if not in privacy mode
    const privacyMode = req.body.privacy_mode === 'true' || req.body.privacy_mode === true;
    
    if (!privacyMode) {
      try {
        await ScanHistory.create({
          userId: req.userId,
          scanType: 'email',
          inputText: emailText.substring(0, 5000), // Limit size
          status: analysis.status,
          confidence: adjustedConfidence,
          explanation: analysis.explanation,
          detailedReasoning: combinedReasoning,
          scamCategory: analysis.scamCategory,
          suspiciousWords: analysis.suspiciousWords,
          privacyMode: false,
          language: analysis.language,
        });
      } catch (dbError) {
        console.error('Database save error:', dbError);
      }
    }

    res.json(finalResult);
  } catch (error) {
    console.error('Email analysis error:', error);
    res.status(500).json({ error: 'Email analysis failed' });
  }
};

/**
 * Analyze voice message (speech-to-text + scam detection)
 */
export const analyzeVoice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const languageCode = req.body.language || 'en-US';

    // Convert speech to text
    const transcribedText = await speechToText(req.file.buffer, languageCode);

    if (!transcribedText || transcribedText.length < 5) {
      return res.status(400).json({ 
        error: 'Could not transcribe audio. Please ensure audio is clear and in supported format.' 
      });
    }

    // Analyze transcribed text
    const analysis = await analyzeWithAI('text', transcribedText);

    // Save to database if not in privacy mode
    const privacyMode = req.body.privacy_mode === 'true' || req.body.privacy_mode === true;
    
    if (!privacyMode) {
      try {
        await ScanHistory.create({
          userId: req.userId,
          scanType: 'text',
          inputText: transcribedText,
          status: analysis.status,
          confidence: analysis.confidence,
          explanation: analysis.explanation,
          detailedReasoning: analysis.detailedReasoning,
          scamCategory: analysis.scamCategory,
          suspiciousWords: analysis.suspiciousWords,
          privacyMode: false,
          language: analysis.language,
        });
      } catch (dbError) {
        console.error('Database save error:', dbError);
      }
    }

    res.json({
      ...analysis,
      transcribedText,
    });
  } catch (error) {
    console.error('Voice analysis error:', error);
    res.status(500).json({ error: 'Voice analysis failed' });
  }
};

/**
 * Get scan history
 */
export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const category = req.query.category as string;

    const query: any = {
      userId: req.userId,
      privacyMode: false,
    };

    if (category && category !== 'all') {
      query.scamCategory = category;
    }

    const history = await ScanHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .select('-embedding') // Exclude embedding from response
      .lean();

    const total = await ScanHistory.countDocuments(query);

    res.json({
      history,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};

/**
 * Get single scan detail
 */
export const getScanDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { scanId } = req.params;

    const scan = await ScanHistory.findOne({
      _id: scanId,
      userId: req.userId,
    }).lean();

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json(scan);
  } catch (error) {
    console.error('Get scan detail error:', error);
    res.status(500).json({ error: 'Failed to get scan detail' });
  }
};

/**
 * Download PDF report for a scan
 */
export const downloadPDFReport = async (req: AuthRequest, res: Response) => {
  try {
    const { scanId } = req.params;

    const scan = await ScanHistory.findOne({
      _id: scanId,
      userId: req.userId,
    }).lean();

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const user = await User.findById(req.userId);

    const pdfBuffer = await generatePDFReport({
      scanType: scan.scanType,
      inputText: scan.inputText,
      result: {
        status: scan.status,
        confidence: scan.confidence,
        explanation: scan.explanation,
        detailedReasoning: scan.detailedReasoning,
        suspiciousWords: scan.suspiciousWords,
        scamCategory: scan.scamCategory,
        language: scan.language,
      },
      userName: user?.displayName || user?.email,
      timestamp: scan.createdAt,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=scamshield-report-${scanId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
};

/**
 * Get scan statistics
 */
export const getScanStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await ScanHistory.aggregate([
      {
        $match: {
          userId: req.userId,
          privacyMode: false,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await ScanHistory.aggregate([
      {
        $match: {
          userId: req.userId,
          privacyMode: false,
          status: { $in: ['scam', 'warning'] },
        },
      },
      {
        $group: {
          _id: '$scamCategory',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    const totalScans = await ScanHistory.countDocuments({
      userId: req.userId,
      privacyMode: false,
    });

    res.json({
      totalScans,
      statusBreakdown: stats,
      topCategories: categoryStats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
};

/**
 * Delete scan from history
 */
export const deleteScan = async (req: AuthRequest, res: Response) => {
  try {
    const { scanId } = req.params;

    const result = await ScanHistory.deleteOne({
      _id: scanId,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({ error: 'Failed to delete scan' });
  }
};
